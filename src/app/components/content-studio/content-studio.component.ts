import { Component, inject, computed } from '@angular/core';
import { AccountStateService } from '../../services/account-state.service';
import { PostFormat, PostItem, PostStatus } from '../../data/seed-data';

@Component({
  selector: 'app-content-studio',
  template: `
    @if (state.contentMode() === 'kanban') {
      <div
        class="grid gap-3 items-start"
        style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));"
      >
        @for (col of kanbanCols(); track col.key) {
          <section
            class="rounded-[6px] p-[10px] flex flex-col gap-2 min-h-[160px]"
            style="background: rgba(var(--ov), .03); border: 1px solid rgba(var(--ov), .1);"
          >
            <div class="flex items-center gap-2 py-[2px] px-1">
              <span
                class="uppercase"
                style="font: 600 12px/1 var(--font-display); letter-spacing: .08em; color: var(--c-muted);"
              >
                {{ col.title }}
              </span>
              <span class="text-[12px]" style="color: var(--c-dim);">{{ col.posts.length }}</span>
            </div>

            @for (p of col.posts; track p.id) {
              <button
                type="button"
                class="flex flex-col gap-2 items-start p-[10px] rounded-[6px] cursor-pointer w-full text-left"
                [style.background]="
                  state.selId() === p.id ? 'rgba(246,188,3,.12)' : 'var(--c-panel)'
                "
                [style.border]="
                  '1px solid ' +
                  (state.selId() === p.id ? '#f1a10b' : 'rgba(var(--ov), .09)')
                "
                style="color: var(--c-text);"
                (click)="openPost(p.id)"
              >
                <span class="flex items-center gap-2 w-full">
                  <span
                    class="uppercase py-[3px] px-[6px] rounded-[2px]"
                    style="font: 600 10.5px/1 var(--font-display); letter-spacing: .08em; background: rgba(var(--ov), .1); color: var(--c-text);"
                  >
                    {{ formatLabel(p.t) }}
                  </span>
                  <span
                    class="ml-auto flex items-center gap-[6px] text-[12px] whitespace-nowrap"
                    style="color: var(--c-muted);"
                  >
                    <span
                      class="w-2 h-2 rounded-full shrink-0"
                      [style.background]="statusColor(p.s)"
                    ></span>
                    {{ statusLabel(p.s) }}
                  </span>
                </span>
                <span class="font-medium text-[14px] leading-[1.3]">{{ p.topic }}</span>
                <span class="text-[12px]" style="color: var(--c-dim);">{{ postMeta(p) }}</span>
              </button>
            }

            @if (col.posts.length === 0) {
              <div
                class="py-[18px] px-2 text-center text-[13px] rounded-[4px]"
                style="color: var(--c-dim); border: 1px dashed rgba(var(--ov), .14);"
              >
                nenhum post
              </div>
            }
          </section>
        }
      </div>
    } @else {
      <div class="flex items-baseline gap-[10px] mb-3">
        <span class="font-medium">26 out – 01 nov 2026</span>
        <span class="text-[13px]" style="color: var(--c-dim);">
          posts agendados e publicados da semana
        </span>
      </div>
      <div
        class="grid gap-2"
        style="grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));"
      >
        @for (d of calendarDays(); track d.index) {
          <div
            class="rounded-[6px] p-2 flex flex-col gap-[6px] min-h-[140px]"
            style="background: rgba(var(--ov), .03);"
            [style.border]="
              '1px solid ' +
              (d.index === 4 ? 'rgba(246,188,3,.6)' : 'rgba(var(--ov), .1)')
            "
          >
            <div
              class="uppercase pt-[2px] px-[2px] pb-[6px]"
              style="font: 600 12px/1 var(--font-display); letter-spacing: .08em;"
              [style.color]="d.index === 4 ? 'var(--c-acc)' : 'var(--c-muted)'"
            >
              {{ d.label }}
            </div>
            @for (p of d.posts; track p.id) {
              <button
                type="button"
                class="flex flex-col gap-1 items-start py-[7px] px-2 rounded-[4px] cursor-pointer w-full text-left"
                [style.background]="
                  state.selId() === p.id ? 'rgba(246,188,3,.12)' : 'var(--c-panel)'
                "
                [style.border]="
                  '1px solid ' +
                  (state.selId() === p.id ? '#f1a10b' : 'rgba(var(--ov), .09)')
                "
                style="color: var(--c-text);"
                (click)="openPost(p.id)"
              >
                <span
                  class="text-[12px] flex items-center gap-[6px]"
                  style="color: var(--c-muted);"
                >
                  <span
                    class="w-2 h-2 rounded-full shrink-0"
                    [style.background]="statusColor(p.s)"
                  ></span>
                  {{ p.time }} . {{ formatLabel(p.t) }}
                </span>
                <span class="text-[13px] leading-[1.3] font-medium">{{ p.topic }}</span>
              </button>
            }
          </div>
        }
      </div>
    }

    <!-- Slide-over Drawer do Post -->
    @if (state.selectedPost(); as sel) {
      <div
        class="absolute top-0 right-0 bottom-0 flex flex-col z-10"
        style="width: min(440px, 100%); background: var(--c-panel); border-left: 1px solid rgba(var(--ov), .2); box-shadow: -6px 0 20px rgba(0,0,0,.35);"
      >
        <div
          class="pt-4 px-[18px] pb-3 flex flex-col gap-[10px]"
          style="border-bottom: 1px solid rgba(var(--ov), .09);"
        >
          <div class="flex items-center gap-2">
            <span
              class="uppercase py-[3px] px-[6px] rounded-[2px]"
              style="font: 600 10.5px/1 var(--font-display); letter-spacing: .08em; background: rgba(var(--ov), .1);"
            >
              {{ formatLabel(sel.t) }}
            </span>
            <span class="flex items-center gap-[6px] text-[12.5px]" style="color: var(--c-muted);">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                [style.background]="statusColor(sel.s)"
              ></span>
              {{ statusLabel(sel.s) }}
            </span>
            <button
              type="button"
              class="ml-auto bg-transparent border-0 text-[20px] leading-none cursor-pointer py-[2px] px-[6px]"
              style="color: var(--c-muted);"
              (click)="state.selId.set(null)"
            >
              ×
            </button>
          </div>

          <div class="text-[19px] font-medium leading-[1.25]">{{ sel.topic }}</div>

          <div class="flex gap-[6px] flex-wrap">
            @for (m of statusMoves; track m.status) {
              <button
                type="button"
                class="h-[26px] px-[10px] rounded-full text-[12.5px] cursor-pointer"
                [style.border]="
                  '1px solid ' +
                  (sel.s === m.status ? '#f1a10b' : 'rgba(var(--ov), .18)')
                "
                [style.background]="
                  sel.s === m.status ? 'rgba(246,188,3,.16)' : 'transparent'
                "
                [style.color]="
                  sel.s === m.status ? 'var(--c-acc)' : 'var(--c-text2)'
                "
                (click)="state.moveSelectedPostStatus(m.status)"
              >
                {{ m.label }}
              </button>
            }
          </div>

          <div class="flex gap-[18px] -mb-3">
            <button
              type="button"
              class="bg-transparent border-0 py-2 px-0 cursor-pointer text-[14px]"
              [style.border-bottom]="
                '2px solid ' +
                (state.drawerTab() === 'cap' ? '#f6bc03' : 'transparent')
              "
              [style.color]="
                state.drawerTab() === 'cap' ? 'var(--c-text)' : 'var(--c-muted)'
              "
              [style.font-weight]="state.drawerTab() === 'cap' ? '500' : '400'"
              (click)="state.drawerTab.set('cap')"
            >
              legenda
            </button>
            <button
              type="button"
              class="bg-transparent border-0 py-2 px-0 cursor-pointer text-[14px]"
              [style.border-bottom]="
                '2px solid ' +
                (state.drawerTab() === 'pr' ? '#f6bc03' : 'transparent')
              "
              [style.color]="
                state.drawerTab() === 'pr' ? 'var(--c-text)' : 'var(--c-muted)'
              "
              [style.font-weight]="state.drawerTab() === 'pr' ? '500' : '400'"
              (click)="state.drawerTab.set('pr')"
            >
              prompts de imagem
            </button>
          </div>
        </div>

        <div class="flex-1 min-h-0 overflow-auto py-4 px-[18px] flex flex-col gap-3">
          @if (state.drawerTab() === 'cap') {
            <label
              class="uppercase"
              style="font: 600 11px/1 var(--font-display); letter-spacing: .08em; color: var(--c-dim);"
            >
              legenda
            </label>
            <textarea
              rows="10"
              class="w-full resize-y rounded-[10px] p-3 text-[14px] leading-[1.55] cm-input-focus"
              style="background: var(--c-sunk); border: 1px solid rgba(var(--ov), .09); color: var(--c-text); box-shadow: inset 0 1px 2px rgba(0,0,0,.3);"
              [value]="selectedCaption(sel)"
              (input)="onCaptionEdit(sel.id, $any($event.target).value)"
            ></textarea>
            <div class="flex gap-[6px] flex-wrap">
              @for (h of sel.tags; track h) {
                <span
                  class="py-[5px] px-2 rounded-[2px]"
                  style="font: 12px/1 var(--font-mono); background: rgba(var(--ov), .08); color: var(--c-acc);"
                >
                  {{ h }}
                </span>
              }
            </div>
            <div class="text-[12.5px]" style="color: var(--c-dim);">
              gerado por {{ sel.ai }} . brand voice de @{{ state.activeAccount().user }} aplicado
            </div>
          } @else {
            @for (pr of sel.pr; track $index) {
              <div
                class="rounded-[6px] p-3 flex flex-col gap-2"
                style="background: var(--c-card); border: 1px solid rgba(var(--ov), .09);"
              >
                <div class="flex items-center gap-2">
                  <span class="font-medium">{{ pr.t }}</span>
                  <span
                    class="py-[3px] px-[6px] rounded-[2px]"
                    style="font: 11px/1 var(--font-mono); color: var(--c-acc); background: rgba(246,188,3,.12);"
                  >
                    {{ pr.ar }}
                  </span>
                  <button
                    type="button"
                    class="ml-auto h-[26px] px-[10px] rounded-[4px] text-[12.5px] cursor-pointer cm-hover-ov12"
                    style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .18); color: var(--c-text);"
                    (click)="state.copyText(pr.x, sel.id + $index)"
                  >
                    {{ state.copied() === sel.id + $index ? 'copiado' : 'copiar prompt' }}
                  </button>
                </div>
                <div
                  style="font: 12.5px/1.55 var(--font-mono); color: var(--c-text2);"
                >
                  {{ pr.x }}
                </div>
              </div>
            }

            @if (sel.pr.length === 0) {
              <div
                class="py-[22px] px-[14px] rounded-[6px] text-center flex flex-col gap-[10px] items-center"
                style="border: 1px dashed rgba(var(--ov), .2);"
              >
                <div style="color: var(--c-muted);">Nenhum prompt de imagem neste post.</div>
                <button
                  type="button"
                  class="h-[30px] px-[14px] rounded-[4px] cursor-pointer cm-hover-ov12"
                  style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .18); color: var(--c-acc);"
                  (click)="state.generatePromptForSelectedPost()"
                >
                  gerar prompt com ia »
                </button>
              </div>
            }
          }
        </div>

        <div
          class="py-3 px-[18px] flex flex-col gap-2"
          style="border-top: 1px solid rgba(var(--ov), .09); background: var(--c-sunk);"
        >
          <div class="text-[12.5px]" style="color: var(--c-dim);">
            Publicação exige mídia final: /media → /media_publish (Graph API v22.0).
          </div>
          <div class="flex gap-2">
            <button
              type="button"
              class="h-8 px-[14px] rounded-[4px] cursor-pointer cm-hover-ov12"
              style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .18); color: var(--c-text);"
              (click)="state.toast('Upload simples: arte final vinculada em media_urls')"
            >
              anexar mídia
            </button>
            <button
              type="button"
              disabled
              class="h-8 px-[14px] rounded-[4px] cursor-not-allowed"
              style="background: var(--c-card); border: 1px solid rgba(var(--ov), .1); color: var(--c-dim);"
            >
              publicar agora
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ContentStudioComponent {
  readonly state = inject(AccountStateService);

  readonly statusMoves: { status: PostStatus; label: string }[] = [
    { status: 'DRAFT', label: 'rascunho' },
    { status: 'PROMPT_READY', label: 'prompt pronto' },
    { status: 'SCHEDULED', label: 'agendar' },
  ];

  readonly kanbanCols = computed(() => {
    const posts = this.state.accountPosts();
    const defs: [PostStatus, string][] = [
      ['DRAFT', 'rascunho'],
      ['PROMPT_READY', 'prompt pronto'],
      ['SCHEDULED', 'agendado'],
      ['PUBLISHED', 'publicado'],
    ];
    return defs.map(([st, title]) => ({
      key: st,
      title,
      posts: posts.filter(
        (p) => p.s === st || (st === 'SCHEDULED' && p.s === 'FAILED')
      ),
    }));
  });

  readonly calendarDays = computed(() => {
    const posts = this.state.accountPosts();
    return this.state.days.map((label, index) => ({
      index,
      label,
      posts: posts
        .filter((p) => p.day === index)
        .sort((a, b) => (a.time < b.time ? -1 : 1)),
    }));
  });

  openPost(postId: string): void {
    this.state.selId.set(postId);
    this.state.drawerTab.set('cap');
  }

  selectedCaption(p: PostItem): string {
    const drafts = this.state.captionDrafts();
    return drafts[p.id] !== undefined ? drafts[p.id] : p.cap;
  }

  onCaptionEdit(postId: string, val: string): void {
    this.state.captionDrafts.update((prev) => ({ ...prev, [postId]: val }));
  }

  formatLabel(t: PostFormat): string {
    const map: Record<PostFormat, string> = {
      IMAGE: 'Imagem',
      CAROUSEL: 'Carrossel',
      REELS: 'Reels',
      STORIES: 'Stories',
    };
    return map[t];
  }

  statusLabel(s: PostStatus): string {
    const map: Record<PostStatus, string> = {
      DRAFT: 'rascunho',
      PROMPT_READY: 'prompt pronto',
      SCHEDULED: 'agendado',
      PUBLISHED: 'publicado',
      FAILED: 'falhou',
    };
    return map[s];
  }

  statusColor(s: PostStatus): string {
    const map: Record<PostStatus, string> = {
      DRAFT: 'var(--c-muted)',
      PROMPT_READY: 'var(--c-info)',
      SCHEDULED: 'var(--c-acc)',
      PUBLISHED: 'var(--c-ok)',
      FAILED: 'var(--c-err)',
    };
    return map[s];
  }

  postMeta(p: PostItem): string {
    if (p.day !== null) {
      return this.state.days[p.day] + (p.time ? ` . ${p.time}` : '');
    }
    if (p.pr.length > 0) {
      return `${p.pr.length} prompt${p.pr.length > 1 ? 's' : ''}`;
    }
    return 'sem data';
  }
}

