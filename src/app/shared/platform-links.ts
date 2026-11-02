import { Account } from '../data/seed-data';

export interface PlatformLinks {
  instagramProfile: string;
  instagramDirect: string;
  businessInbox: string | null;
  businessHome: string | null;
  adsManager: string | null;
}

/**
 * Atalhos para conferir publicações, mensagens e campanhas direto nas plataformas Meta.
 * Usados onde o painel ainda não traz esses dados: o usuário vê tudo na fonte.
 */
export function platformLinks(acc: Pick<Account, 'user' | 'pageId' | 'adAccountId'>): PlatformLinks {
  const page = acc.pageId ? encodeURIComponent(acc.pageId) : '';
  const adAccount = acc.adAccountId ? acc.adAccountId.replace(/^act_/, '') : '';
  return {
    instagramProfile: `https://www.instagram.com/${encodeURIComponent(acc.user)}/`,
    instagramDirect: 'https://www.instagram.com/direct/inbox/',
    businessInbox: page ? `https://business.facebook.com/latest/inbox/all?asset_id=${page}` : null,
    businessHome: page ? `https://business.facebook.com/latest/home?asset_id=${page}` : null,
    adsManager: adAccount ? `https://adsmanager.facebook.com/adsmanager/manage/campaigns?act=${adAccount}` : null,
  };
}
