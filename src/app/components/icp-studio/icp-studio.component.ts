import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AccountStateService } from '../../services/account-state.service';
import { CodemixButtonComponent } from '../codemix-button.component';
import { IcpProfile, IcpSegmentType, ContactItem } from '../../data/seed-data';

type IcpTab = 'matrix' | 'scoring' | 'simulator' | 'hooks';

@Component({
  selector: 'app-icp-studio',
  imports: [CommonModule, FormsModule, CodemixButtonComponent],
  template: `
    <div class="flex flex-col gap-5">
      <!-- HEADER DO ICP STUDIO -->
      <div
        class="rounded-[8px] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style="background: var(--c-panel); border: 1px solid rgba(var(--ov), .1); box-shadow: 0 4px 20px rgba(0,0,0,.15);"
      >
        <div class="flex flex-col gap-1.5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <h1 class="text-xl font-bold tracking-tight text-[var(--c-text)]">
              ICP Studio — Perfil de Cliente Ideal Agnóstico
            </h1>
            <span
              class="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium flex items-center gap-1.5"
              style="background: rgba(241, 161, 11, 0.15); color: #f59e0b; border: 1px solid rgba(241, 161, 11, 0.3);"
            >
              Matriz Universal 360°
            </span>
            <span
              class="px-2 py-0.5 rounded text-[11px] font-mono text-[var(--c-muted)]"
              style="background: rgba(var(--ov), .05); border: 1px solid rgba(var(--ov), .08);"
            >
              Segmento: {{ state.activeIcpProfile().segmentType }}
            </span>
          </div>
          <p class="text-xs text-[var(--c-muted)]">
            Modele o perfil de cliente dos sonhos, filtre curiosos e gere públicos Lookalike de 1% na Meta alimentados apenas por leads qualificados.
          </p>
        </div>

        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Seletor de Perfil de ICP -->
          <div class="flex items-center gap-2">
            <span class="text-xs text-[var(--c-muted)] font-mono">Perfil Ativo:</span>
            <select
              class="h-8 px-2.5 rounded-[4px] text-xs font-mono cursor-pointer"
              style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .15); color: var(--c-text);"
              [value]="state.activeIcpId()"
              (change)="onIcpChange($event)"
            >
              @for (p of state.accountIcps(); track p.id) {
                <option [value]="p.id" style="background: #2b2b2b; color: #fefefe;">
                  {{ p.name }}
                </option>
              }
            </select>
          </div>

          <cm-button
            variant="ghost"
            size="sm"
            (clicked)="openAiGeneratorModal()"
          >
            <span>✨ gerar com ia</span>
          </cm-button>

          <cm-button
            variant="primary"
            size="sm"
            [arrow]="true"
            (clicked)="state.exportTier1ToMetaLookalike(1)"
          >
            <span>🎯 gerar lookalike ouro</span>
          </cm-button>
        </div>
      </div>

      <!-- KPI METRICS SUMMARY DA BASE -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div class="kpi-card highlight">
          <div class="kpi-label">Leads Tier 1 (Ouro)</div>
          <div class="kpi-value text-amber-500 font-bold">
            {{ state.icpStats().tier1Count }} <span class="text-xs font-normal text-[var(--c-muted)]">({{ state.icpStats().tier1Pct }}%)</span>
          </div>
          <div class="kpi-sub">Score ≥ 80% • Pronto para Lookalike</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Leads Tier 2 (Prata)</div>
          <div class="kpi-value text-sky-400 font-bold">
            {{ state.icpStats().tier2Count }}
          </div>
          <div class="kpi-sub">Score 50-79% • Em nutrição</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Curiosos Descartados</div>
          <div class="kpi-value text-rose-400 font-bold">
            {{ state.icpStats().descarteCount }}
          </div>
          <div class="kpi-sub">Red Flags detectadas • Fora do Lookalike</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-label">Ticket Médio Alvo</div>
          <div class="kpi-value text-emerald-400 font-bold">
            {{ state.activeIcpProfile().ticketMedio }}
          </div>
          <div class="kpi-sub">{{ state.activeIcpProfile().companyProfile }}</div>
        </div>
      </div>

      <!-- NAVEGAÇÃO DE SUB-ABAS DO ICP -->
      <div class="flex items-center justify-between border-b border-[rgba(var(--ov),.1)] pb-1 gap-2 flex-wrap">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'matrix'"
            (click)="activeTab.set('matrix')"
          >
            <span>Matriz 360° do ICP</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'scoring'"
            (click)="activeTab.set('scoring')"
          >
            <span>Classificador de Leads</span>
            <span class="tab-badge">{{ currentAccountContacts().length }}</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'simulator'"
            (click)="activeTab.set('simulator')"
          >
            <span>Simulador de Lead</span>
            <span class="tab-badge ai">IA</span>
          </button>

          <button
            type="button"
            class="tab-btn"
            [class.active]="activeTab() === 'hooks'"
            (click)="activeTab.set('hooks')"
          >
            <span>Ganchos & Criativos Meta</span>
            <span class="tab-badge">{{ state.activeIcpProfile().hooks.length }}</span>
          </button>
        </div>
      </div>

      <!-- ================= ABA 1: MATRIZ VISUAL 360° DO ICP ================= -->
      @if (activeTab() === 'matrix') {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- 1. Dores Crônicas (Pains) -->
          <div class="quadrant-card">
            <div class="quadrant-head text-rose-400 border-rose-500/20 bg-rose-500/10">
              <span class="font-bold">⚡ Dores Crônicas (Pains)</span>
              <span class="text-[10px] font-mono">O que tira o sono dele</span>
            </div>
            <ul class="flex flex-col gap-2 p-3 text-xs">
              @for (p of state.activeIcpProfile().pains; track p) {
                <li class="flex items-start gap-2 text-[var(--c-text)]">
                  <span class="text-rose-400 mt-0.5">•</span>
                  <span>{{ p }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- 2. Desejos & Transformação (Gains) -->
          <div class="quadrant-card">
            <div class="quadrant-head text-emerald-400 border-emerald-500/20 bg-emerald-500/10">
              <span class="font-bold">🎯 Desejos & Transformação</span>
              <span class="text-[10px] font-mono">O estado desejado</span>
            </div>
            <ul class="flex flex-col gap-2 p-3 text-xs">
              @for (d of state.activeIcpProfile().desires; track d) {
                <li class="flex items-start gap-2 text-[var(--c-text)]">
                  <span class="text-emerald-400 mt-0.5">•</span>
                  <span>{{ d }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- 3. Green Flags (Tier 1 Ouro) -->
          <div class="quadrant-card">
            <div class="quadrant-head text-amber-400 border-amber-500/20 bg-amber-500/10">
              <span class="font-bold">🏆 Green Flags (Qualificação)</span>
              <span class="text-[10px] font-mono">Gera Lookalike 1%</span>
            </div>
            <ul class="flex flex-col gap-2 p-3 text-xs">
              @for (gf of state.activeIcpProfile().greenFlags; track gf) {
                <li class="flex items-start gap-2 text-[var(--c-text)]">
                  <span class="text-amber-400 mt-0.5">✓</span>
                  <span>{{ gf }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- 4. Red Flags (Descarte) -->
          <div class="quadrant-card">
            <div class="quadrant-head text-red-400 border-red-500/20 bg-red-500/10">
              <span class="font-bold">🚫 Red Flags (Eliminatórias)</span>
              <span class="text-[10px] font-mono">Bloquear do Lookalike</span>
            </div>
            <ul class="flex flex-col gap-2 p-3 text-xs">
              @for (rf of state.activeIcpProfile().redFlags; track rf) {
                <li class="flex items-start gap-2 text-[var(--c-text-muted)]">
                  <span class="text-red-400 mt-0.5">✕</span>
                  <span>{{ rf }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- 5. Objeções Recorrentes -->
          <div class="quadrant-card">
            <div class="quadrant-head text-sky-400 border-sky-500/20 bg-sky-500/10">
              <span class="font-bold">🛡️ Objeções de Fechamento</span>
              <span class="text-[10px] font-mono">Barreiras de compra</span>
            </div>
            <ul class="flex flex-col gap-2 p-3 text-xs">
              @for (ob of state.activeIcpProfile().objections; track ob) {
                <li class="flex items-start gap-2 text-[var(--c-text)]">
                  <span class="text-sky-400 mt-0.5">?</span>
                  <span>{{ ob }}</span>
                </li>
              }
            </ul>
          </div>

          <!-- 6. Interesses & Palavras-Chave Meta -->
          <div class="quadrant-card">
            <div class="quadrant-head text-purple-400 border-purple-500/20 bg-purple-500/10">
              <span class="font-bold">🔍 Interesses Meta Ads</span>
              <span class="text-[10px] font-mono">Refinamento de público</span>
            </div>
            <div class="p-3 flex flex-wrap gap-1.5">
              @for (kw of state.activeIcpProfile().metaKeywords; track kw) {
                <span class="px-2 py-1 rounded text-[11px] font-mono bg-[rgba(var(--ov),.06)] text-[var(--c-text)] border border-[rgba(var(--ov),.1)]">
                  # {{ kw }}
                </span>
              }
            </div>
          </div>
        </div>
      }

      <!-- ================= ABA 2: CLASSIFICADOR DE LEADS ================= -->
      @if (activeTab() === 'scoring') {
        <div class="card-p flex flex-col gap-4">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="card-title text-sm">Leads Avaliados contra a Matriz ICP Atual</div>
              <div class="card-sub text-xs">
                Somente os contatos com Score ≥ 80% (Tier 1 Ouro) são recomendados para a criação de Lookalike na Meta.
              </div>
            </div>

            <div class="flex items-center gap-2">
              <cm-button
                variant="primary"
                size="sm"
                [arrow]="true"
                (clicked)="state.exportTier1ToMetaLookalike(1)"
              >
                <span>🎯 exportar Tier 1 ({{ state.icpStats().tier1Count }} leads) para lookalike</span>
              </cm-button>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead>
                <tr class="border-b border-[rgba(var(--ov),.1)] text-[11px] font-mono uppercase text-[var(--c-muted)]">
                  <th class="py-2.5 px-3">Lead / Usuário</th>
                  <th class="py-2.5 px-3">Origem</th>
                  <th class="py-2.5 px-3">E-mail / Telefone</th>
                  <th class="py-2.5 px-3">ICP Score</th>
                  <th class="py-2.5 px-3">Classificação ICP</th>
                  <th class="py-2.5 px-3 text-right">Ajuste</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[rgba(var(--ov),.06)]">
                @for (c of currentAccountContacts(); track c.id) {
                  <tr class="hover:bg-[rgba(var(--ov),.02)]">
                    <td class="py-3 px-3 font-medium text-[var(--c-text)]">
                      &#64;{{ c.u }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[11px] text-[var(--c-text)]">
                      {{ c.src }}
                    </td>

                    <td class="py-3 px-3 font-mono text-[11px] text-[var(--c-muted)]">
                      {{ c.email || c.phone || '—' }}
                    </td>

                    <td class="py-3 px-3">
                      <div class="flex items-center gap-2">
                        <div class="w-16 h-2 rounded-full bg-[rgba(var(--ov),.1)] overflow-hidden">
                          <div
                            class="h-full rounded-full"
                            [style.width.%]="c.icpScore || 50"
                            [style.background]="(c.icpScore || 0) >= 80 ? '#f59e0b' : (c.icpScore || 0) >= 50 ? '#38bdf8' : '#f43f5e'"
                          ></div>
                        </div>
                        <span class="font-mono font-bold text-[11px] text-[var(--c-text)]">
                          {{ c.icpScore || 50 }}%
                        </span>
                      </div>
                    </td>

                    <td class="py-3 px-3 whitespace-nowrap">
                      @if ((c.icpScore || 0) >= 80) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          🏆 TIER 1 (OURO)
                        </span>
                      } @else if ((c.icpScore || 0) >= 50) {
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-sky-500/15 text-sky-400 border border-sky-500/30">
                          ⚡ TIER 2 (PRATA)
                        </span>
                      } @else {
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-rose-500/15 text-rose-400 border border-rose-500/30">
                          ✕ DESQUALIFICADO
                        </span>
                      }
                    </td>

                    <td class="py-3 px-3 text-right">
                      <button
                        type="button"
                        class="px-2 py-1 rounded text-[10px] font-mono border border-[rgba(var(--ov),.15)] bg-[rgba(var(--ov),.05)] text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
                        (click)="state.scoreContact(c.id, (c.icpScore || 50) >= 80 ? 45 : 92)"
                        title="Alternar qualificação manual"
                      >
                        {{ (c.icpScore || 0) >= 80 ? 'Rebaixar' : 'Promover Ouro' }}
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }

      <!-- ================= ABA 3: SIMULADOR DE LEAD AVULSO ================= -->
      @if (activeTab() === 'simulator') {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="card-p flex flex-col gap-3">
            <div>
              <div class="card-title text-sm">Testar Lead contra o ICP Ativo</div>
              <div class="card-sub text-xs">
                Cole uma mensagem de direct, comentário ou transcrição de conversa para avaliar o percentual de afinidade.
              </div>
            </div>

            <textarea
              rows="6"
              class="w-full p-3 rounded-[6px] text-xs font-mono bg-[rgba(var(--ov),.06)] border border-[rgba(var(--ov),.15)] text-[var(--c-text)]"
              placeholder="Ex: 'Oi, tenho uma clínica com 3 veterinários faturando 70k e perdemos muitas consultas por no-show. Quero implementar um bot para confirmar no WhatsApp. Vocês têm vaga essa semana?'"
              [(ngModel)]="simLeadText"
            ></textarea>

            <cm-button
              variant="primary"
              size="sm"
              [fullWidth]="true"
              (clicked)="runLeadSimulation()"
            >
              <span>🔍 simular qualificação do lead</span>
            </cm-button>
          </div>

          <div class="card-p flex flex-col gap-3 justify-center">
            @if (simResult()) {
              <div class="flex items-center justify-between border-b border-[rgba(var(--ov),.1)] pb-2">
                <span class="text-xs font-mono uppercase text-[var(--c-muted)]">Resultado da Análise</span>
                <span
                  class="px-2.5 py-0.5 rounded text-xs font-mono font-bold"
                  [style.background]="simResult()!.score >= 80 ? 'rgba(241, 161, 11, 0.2)' : 'rgba(244, 63, 94, 0.2)'"
                  [style.color]="simResult()!.score >= 80 ? '#f59e0b' : '#f43f5e'"
                >
                  Score: {{ simResult()!.score }}% • {{ simResult()!.tier }}
                </span>
              </div>

              <p class="text-xs text-[var(--c-text)] leading-relaxed">
                {{ simResult()!.justification }}
              </p>

              <div class="rounded p-2.5 bg-[rgba(var(--ov),.04)] text-[11px] flex flex-col gap-1 border border-[rgba(var(--ov),.08)]">
                <div class="flex justify-between">
                  <span class="text-[var(--c-muted)]">Ação recomendada:</span>
                  <span class="font-bold text-amber-500">{{ simResult()!.action }}</span>
                </div>
              </div>
            } @else {
              <div class="text-center py-8 text-[var(--c-muted)] text-xs">
                Cole o texto ao lado e clique em simular para auditar a aderência ao ICP.
              </div>
            }
          </div>
        </div>
      }

      <!-- ================= ABA 4: GANCHOS PARA ANÚNCIOS ================= -->
      @if (activeTab() === 'hooks') {
        <div class="card-p flex flex-col gap-4">
          <div>
            <div class="card-title text-sm">Ganchos Criativos (Hooks) Alinhados ao ICP</div>
            <div class="card-sub text-xs">
              Copys desenhadas especificamente para tocar nas dores e filtros do seu perfil ideal em anúncios da Meta.
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
            @for (hook of state.activeIcpProfile().hooks; track hook) {
              <div class="aud-card flex flex-col justify-between gap-3">
                <p class="text-xs font-medium text-[var(--c-text)] italic">
                  "{{ hook }}"
                </p>

                <div class="flex items-center justify-between pt-2 border-t border-[rgba(var(--ov),.08)]">
                  <span class="text-[10px] font-mono text-[var(--c-muted)]">Lookalike 1%</span>
                  <button
                    type="button"
                    class="px-2 py-1 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 cursor-pointer"
                    (click)="state.quickPromoteWithLookalike(hook)"
                  >
                    🚀 Criar Anúncio
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- ================= MODAL: GERADOR DE ICP COM IA ================= -->
      @if (showAiModal()) {
        <div class="modal-backdrop" (click)="showAiModal.set(false)">
          <div class="modal-box" (click)="$event.stopPropagation()">
            <div class="flex items-center justify-between border-b border-[rgba(var(--ov),.1)] pb-3">
              <h3 class="text-base font-bold text-[var(--c-text)]">Gerador de ICP Universal com IA</h3>
              <button
                type="button"
                class="text-lg text-[var(--c-muted)] hover:text-[var(--c-text)] cursor-pointer"
                (click)="showAiModal.set(false)"
              >
                ✕
              </button>
            </div>

            <div class="flex flex-col gap-3 py-3 text-xs">
              <div>
                <label class="block font-mono uppercase text-[11px] text-[var(--c-muted)] mb-1">
                  Segmento de Mercado
                </label>
                <select class="modal-input" [(ngModel)]="aiSegment">
                  <option value="B2B">B2B (Empresas vendendo para empresas)</option>
                  <option value="B2C">B2C (Consumidor final)</option>
                  <option value="D2C">D2C (E-commerce / Marca direta)</option>
                  <option value="SERVICOS">Prestação de Serviços / Consultoria</option>
                </select>
              </div>

              <div>
                <label class="block font-mono uppercase text-[11px] text-[var(--c-muted)] mb-1">
                  Descreva o que você vende e qual seu produto/serviço
                </label>
                <textarea
                  rows="4"
                  class="w-full p-2.5 rounded-[4px] text-xs font-mono bg-[rgba(var(--ov),.06)] border border-[rgba(var(--ov),.15)] text-[var(--c-text)]"
                  placeholder="Ex: 'Vendo implantação de agentes de inteligência artificial para SaaS e empresas de tecnologia automatizarem atendimento no WhatsApp e Instagram'"
                  [(ngModel)]="aiPromptDesc"
                ></textarea>
              </div>

              <div class="rounded p-2.5 bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300">
                💡 A IA estruturará automaticamente dores crônicas, critérios eliminatórios (Red Flags), qualificadores (Green Flags), objeções e ganchos de anúncios.
              </div>
            </div>

            <div class="flex items-center justify-end gap-2 pt-3 border-t border-[rgba(var(--ov),.1)]">
              <button
                type="button"
                class="px-3 py-1.5 rounded text-xs text-[var(--c-muted)] cursor-pointer"
                (click)="showAiModal.set(false)"
              >
                Cancelar
              </button>
              <cm-button
                variant="primary"
                size="sm"
                [arrow]="true"
                (clicked)="submitAiGeneration()"
              >
                <span>gerar matriz 360°</span>
              </cm-button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .kpi-card {
        background: var(--c-panel);
        border: 1px solid rgba(var(--ov), 0.08);
        border-radius: 6px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 3px;
      }
      .kpi-card.highlight {
        border-color: rgba(246, 188, 3, 0.4);
        background: rgba(246, 188, 3, 0.04);
      }
      .kpi-label {
        font-family: var(--font-mono);
        font-size: 10px;
        text-transform: uppercase;
        color: var(--c-muted);
      }
      .kpi-value {
        font-family: var(--font-display);
        font-size: 18px;
        font-weight: 700;
        color: var(--c-text);
      }
      .kpi-sub {
        font-size: 11px;
        color: var(--c-muted);
      }
      .tab-btn {
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-weight: 500;
        color: var(--c-muted);
        background: transparent;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.15s ease;
      }
      .tab-btn:hover {
        color: var(--c-text);
        background: rgba(var(--ov), 0.04);
      }
      .tab-btn.active {
        color: var(--c-text);
        background: rgba(var(--ov), 0.08);
        font-weight: 600;
      }
      .tab-badge {
        font-size: 10px;
        font-family: var(--font-mono);
        padding: 1px 5px;
        border-radius: 999px;
        background: rgba(var(--ov), 0.1);
        color: var(--c-text);
      }
      .tab-badge.ai {
        background: rgba(246, 188, 3, 0.2);
        color: var(--c-acc);
      }
      .card-p {
        background: var(--c-panel);
        border: 1px solid rgba(var(--ov), 0.1);
        border-radius: 6px;
        padding: 16px;
      }
      .card-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--c-text);
      }
      .card-sub {
        font-size: 12px;
        color: var(--c-muted);
      }
      .quadrant-card {
        background: rgba(var(--ov), 0.03);
        border: 1px solid rgba(var(--ov), 0.08);
        border-radius: 6px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .quadrant-head {
        padding: 8px 12px;
        border-bottom: 1px solid;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
      }
      .aud-card {
        background: rgba(var(--ov), 0.03);
        border: 1px solid rgba(var(--ov), 0.08);
        border-radius: 6px;
        padding: 14px;
      }
      .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
      }
      .modal-box {
        background: var(--c-panel);
        border: 1px solid rgba(var(--ov), 0.2);
        border-radius: 8px;
        width: 100%;
        max-width: 480px;
        padding: 20px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      }
      .modal-input {
        width: 100%;
        height: 34px;
        padding: 0 10px;
        border-radius: 4px;
        background: rgba(var(--ov), 0.06);
        border: 1px solid rgba(var(--ov), 0.15);
        color: var(--c-text);
        font-family: var(--font-sans);
        font-size: 12px;
      }
    `,
  ],
})
export class IcpStudioComponent {
  readonly state = inject(AccountStateService);

  readonly activeTab = signal<IcpTab>('matrix');
  readonly showAiModal = signal<boolean>(false);

  // Formulário IA
  aiSegment: IcpSegmentType = 'B2B';
  aiPromptDesc = 'SaaS e automações com IA para empresas escalarem atendimento no WhatsApp';

  // Simulador
  simLeadText = '';
  simResult = signal<{ score: number; tier: string; justification: string; action: string } | null>(null);

  readonly currentAccountContacts = computed(() => {
    const accId = this.state.activeAccount().id;
    return this.state.contacts().filter((c) => c.a === accId);
  });

  onIcpChange(e: Event): void {
    const val = (e.target as HTMLSelectElement).value;
    this.state.selectIcpProfile(val);
  }

  openAiGeneratorModal(): void {
    this.showAiModal.set(true);
  }

  async submitAiGeneration(): Promise<void> {
    if (!this.aiPromptDesc.trim()) {
      this.state.toast('Descreva seu produto ou serviço');
      return;
    }

    await this.state.generateIcpWithAi(this.aiPromptDesc, this.aiSegment);
    this.showAiModal.set(false);
  }

  runLeadSimulation(): void {
    const txt = this.simLeadText.trim().toLowerCase();
    if (!txt) {
      this.state.toast('Cole o texto do lead para simular');
      return;
    }

    const hasUrgency = txt.includes('urgente') || txt.includes('essa semana') || txt.includes('hoje') || txt.includes('quando');
    const hasBudget = txt.includes('faturamento') || txt.includes('k') || txt.includes('preço') || txt.includes('investir') || txt.includes('orçamento');
    const hasTeam = txt.includes('time') || txt.includes('equipe') || txt.includes('sócio') || txt.includes('clínica') || txt.includes('empresa');

    let score = 50;
    if (hasUrgency) score += 20;
    if (hasBudget) score += 18;
    if (hasTeam) score += 12;

    if (txt.includes('grátis') || txt.includes('de graça') || txt.includes('sem custo')) {
      score = 25;
    }

    const tier = score >= 80 ? 'TIER 1 (OURO)' : score >= 50 ? 'TIER 2 (PRATA)' : 'DESQUALIFICADO';
    const justification = score >= 80
      ? 'O lead demonstrou tomador de decisão, dor real urgente e maturidade financeira compatível com seu ticket médio.'
      : score >= 50
      ? 'O lead tem potencial interesse mas ainda precisa de nutrição para validar orçamento e poder de decisão.'
      : 'Detectadas Red Flags eliminatórias (busca de solução gratuita ou sem faturamento mínimo).';

    const action = score >= 80
      ? 'Enviar imediatamente para o WhatsApp do closer e incluir na lista semente de Lookalike!'
      : score >= 50
      ? 'Manter no fluxo de automação do Instagram até demonstrar mais sinais.'
      : 'Descartar da base para não poluir o algoritmo da Meta.';

    this.simResult.set({ score, tier, justification, action });
  }
}

