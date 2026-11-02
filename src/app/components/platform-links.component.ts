import { Component, computed, input } from '@angular/core';
import { Account } from '../data/seed-data';
import { platformLinks } from '../shared/platform-links';

@Component({
  selector: 'app-platform-links',
  template: `
    <div class="flex flex-wrap gap-2">
      <a
        [href]="links().instagramProfile"
        target="_blank"
        rel="noopener noreferrer"
        class="h-[30px] px-[14px] rounded-[4px] inline-flex items-center cm-hover-ov12 text-[13px] no-underline"
        style="background: rgba(var(--ov), .08); border: 1px solid rgba(var(--ov), .2); color: var(--c-text);"
      >
        Perfil no Instagram ↗
      </a>
      <a
        [href]="links().instagramDirect"
        target="_blank"
        rel="noopener noreferrer"
        class="h-[30px] px-[14px] rounded-[4px] inline-flex items-center cm-hover-ov12 text-[13px] no-underline"
        style="background: rgba(var(--ov), .08); border: 1px solid rgba(var(--ov), .2); color: var(--c-text);"
      >
        Direct no Instagram ↗
      </a>
      @if (links().businessInbox; as inbox) {
        <a
          [href]="inbox"
          target="_blank"
          rel="noopener noreferrer"
          class="h-[30px] px-[14px] rounded-[4px] inline-flex items-center cm-hover-ov12 text-[13px] no-underline"
          style="background: rgba(var(--ov), .08); border: 1px solid rgba(var(--ov), .2); color: var(--c-text);"
        >
          Inbox no Meta Business Suite ↗
        </a>
      }
      @if (links().businessHome; as home) {
        <a
          [href]="home"
          target="_blank"
          rel="noopener noreferrer"
          class="h-[30px] px-[14px] rounded-[4px] inline-flex items-center cm-hover-ov12 text-[13px] no-underline"
          style="background: rgba(var(--ov), .08); border: 1px solid rgba(var(--ov), .2); color: var(--c-text);"
        >
          Publicações no Meta Business Suite ↗
        </a>
      }
      @if (links().adsManager; as ads) {
        <a
          [href]="ads"
          target="_blank"
          rel="noopener noreferrer"
          class="h-[30px] px-[14px] rounded-[4px] inline-flex items-center cm-hover-ov12 text-[13px] no-underline"
          style="background: rgba(var(--ov), .08); border: 1px solid rgba(var(--ov), .2); color: var(--c-text);"
        >
          Campanhas no Gerenciador de Anúncios ↗
        </a>
      }
    </div>
  `,
})
export class PlatformLinksComponent {
  readonly account = input.required<Pick<Account, 'user' | 'pageId' | 'adAccountId'>>();
  readonly links = computed(() => platformLinks(this.account()));
}
