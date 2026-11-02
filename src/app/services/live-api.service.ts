import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { PostItem } from '../data/seed-data';
import { SupabaseService } from './supabase.service';
import { brtParts, todayIso, weekdayIndex } from '../shared/dates';

export interface MetaAdAccountResponse {
  id: string;
  name: string;
  account_status: number;
  currency: string;
  amount_spent: string;
  timezone_name: string;
  balance?: number;
  portfolioId?: string;
  portfolioName?: string;
}

export interface MetaPortfolio {
  id: string;
  name: string;
  adAccounts: MetaAdAccountResponse[];
}

@Injectable({ providedIn: 'root' })
export class LiveApiService {
  private readonly supabase = inject(SupabaseService);

  readonly isSyncing = signal<boolean>(false);
  // Só vira verdadeiro depois de uma resposta real da Meta; começa desconectado e sem sincronização.
  readonly metaApiConnected = signal<boolean>(false);
  readonly lastSyncTime = signal<string>('nunca');
  readonly portfolios = signal<MetaPortfolio[]>([]);

  private get openaiKey(): string {
    return (typeof localStorage !== 'undefined' && localStorage.getItem('openai_api_key')) || environment.openaiApiKey || '';
  }
  private readonly openaiModel = environment.openaiModel || 'gpt-4o-mini';

  /**
   * Lista todas as Business Portfolios acessíveis e suas contas de anúncio (via servidor).
   */
  async fetchPortfolios(): Promise<MetaPortfolio[] | null> {
    try {
      const res = await this.supabase.callMetaApi<{ portfolios: MetaPortfolio[] }>('list_portfolios');
      this.portfolios.set(res.portfolios);
      this.metaApiConnected.set(true);
      return res.portfolios;
    } catch (err) {
      console.warn('Falha ao listar portfólios Meta:', err);
      this.metaApiConnected.set(false);
      return null;
    }
  }

  /**
   * Consulta campanhas reais da conta de anúncios (via servidor).
   */
  async fetchLiveCampaigns(adAccountId: string): Promise<any[] | null> {
    try {
      const res = await this.supabase.callMetaApi<{ data: any[] }>('list_campaigns', { adAccountId });
      return res.data || [];
    } catch (err) {
      console.warn('Falha ao listar campanhas Meta:', err);
      return null;
    }
  }

  /**
   * Publicações reais da Página. O token da página fica no servidor.
   */
  async fetchLivePagePosts(pageId: string, accountId: string): Promise<PostItem[] | null> {
    if (!pageId) return null;
    try {
      // 1. Tenta buscar direto via Graph API com attachments ricos caso haja token de página
      const pageKey = pageId === '185387824832414' ? 'amaral' : pageId === '184846338220933' ? 'duplod' : pageId === '134910416362221' ? 'vetbots' : null;
      const pageToken = pageKey ? (environment.metaPages as any)?.[pageKey]?.token : null;

      let rawPosts: any[] = [];

      if (pageToken) {
        try {
          const fields = 'id,message,created_time,permalink_url,status_type,attachments{media,type,url,subattachments}';
          const directRes = await fetch(`https://graph.facebook.com/v22.0/${pageId}/posts?fields=${fields}&limit=10&access_token=${pageToken}`);
          if (directRes.ok) {
            const dj = await directRes.json();
            if (dj.data && Array.isArray(dj.data)) {
              rawPosts = dj.data;
            }
          }
        } catch {
          // fallback para edge function
        }
      }

      if (rawPosts.length === 0) {
        const res = await this.supabase.callMetaApi<{ data: any[] }>('list_page_posts', { payload: { pageId } });
        if (res?.data && Array.isArray(res.data)) {
          rawPosts = res.data;
        }
      }

      if (rawPosts.length === 0) return null;

      return rawPosts.map((rawPost: any) => {
        const msg = rawPost.message || '';
        const lines = msg.split('\n').filter((l: string) => l.trim().length > 0);
        const topic = lines[0]?.slice(0, 70) || `Publicação Meta #${rawPost.id.slice(-6)}`;
        const hashtags = msg.match(/#[a-zA-Z0-9_À-ÿ]+/g) || ['#meta', '#feed'];
        // Data/hora reais de Brasília; `day` segue a semana começando na segunda (0 = seg).
        const when = brtParts(rawPost.created_time || new Date().toISOString()) ?? { date: todayIso(), time: '00:00' };
        const dayIdx = weekdayIndex(when.date);

        const media: any[] = [];
        const att = rawPost.attachments?.data?.[0];
        if (att) {
          if (att.subattachments?.data && att.subattachments.data.length > 0) {
            att.subattachments.data.forEach((sub: any, sIdx: number) => {
              if (sub.media?.image?.src) {
                media.push({
                  id: `med_${rawPost.id}_${sIdx}`,
                  type: 'image',
                  url: sub.media.image.src,
                  name: `slide_${sIdx + 1}.jpg`,
                  aspectRatio: sub.media.image.height > sub.media.image.width ? '4:5' : '1:1',
                });
              }
            });
          } else if (att.media?.image?.src) {
            media.push({
              id: `med_${rawPost.id}_0`,
              type: 'image',
              url: att.media.image.src,
              name: 'foto_principal.jpg',
              aspectRatio: att.media.image.height > att.media.image.width ? '4:5' : '1:1',
            });
          }
        }

        const isReels = rawPost.permalink_url?.includes('/reel/') || false;
        const isCarousel = media.length > 1 || msg.includes('Arrasta') || msg.includes('Slide');
        const format: any = isReels ? 'REELS' : isCarousel ? 'CAROUSEL' : 'IMAGE';

        return {
          id: `live_${rawPost.id}`,
          a: accountId,
          t: format,
          s: 'PUBLISHED' as const,
          topic,
          cap: msg,
          permalink: rawPost.permalink_url || undefined,
          tags: hashtags,
          pr: [
            {
              t: 'Mídia Meta Oficial',
              ar: format === 'REELS' ? '9:16' : '4:5',
              x: `Publicação real sincronizada via Meta Graph API em ${rawPost.created_time}. Link: ${rawPost.permalink_url || ''}`,
            },
          ],
          date: when.date,
          day: dayIdx,
          time: when.time,
          ai: 'Meta Graph API v22.0',
          media,
        };
      });
    } catch {
      return null;
    }
  }

  /**
   * Geração direta com OpenAI GPT-4o-mini para textos variados e ricos
   */
  async generateWithOpenAi(prompt: string, systemPrompt = 'Você é um estrategista de conteúdo para Instagram.'): Promise<string | null> {
    if (!this.openaiKey) return null;
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.openaiKey}`,
        },
        body: JSON.stringify({
          model: this.openaiModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: 600,
          temperature: 0.7,
        }),
      });

      if (!res.ok) return null;
      const data = await res.json();
      return data.choices?.[0]?.message?.content?.trim() || null;
    } catch (err) {
      console.warn('Erro ao chamar OpenAI:', err);
      return null;
    }
  }
}
