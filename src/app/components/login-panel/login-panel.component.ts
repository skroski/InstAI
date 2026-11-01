import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { OAuthProvider, SupabaseService } from '../../services/supabase.service';
import { digitsOnly, isEmail } from '../../shared/validators';

const RESEND_SECONDS = 30;

/**
 * Login compartilhado: código por e-mail e, quando ativados no Supabase, Google e Facebook.
 * Alterações na Meta exigem usuário autenticado (a edge function confere o e-mail na allowlist).
 */
@Component({
  selector: 'app-login-panel',
  imports: [FormsModule],
  template: `
    @if (!auth.session()) {
      <section
        class="rounded-[8px] p-4 flex flex-col gap-3"
        style="background: var(--c-panel); border: 1px solid rgba(var(--ov), .1);"
        aria-labelledby="login-title">
        <div>
          <h3 id="login-title" class="text-sm font-semibold text-[var(--c-text)]">{{ title() }}</h3>
          <p class="text-xs text-[var(--c-muted)] mt-1">
            Entre para criar e alterar campanhas e para conectar contas. Sem login, o painel só mostra dados.
          </p>
        </div>

        @if (auth.oauthProviders().length > 0) {
          <div class="flex items-center gap-2 flex-wrap">
            @for (p of auth.oauthProviders(); track p) {
              <button
                type="button"
                class="h-9 px-3 rounded-[6px] text-xs font-medium cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .18); color: var(--c-text);"
                [disabled]="busy()"
                (click)="oauth(p)">
                <span aria-hidden="true" class="font-bold">{{ p === 'google' ? 'G' : 'f' }}</span>
                <span>Entrar com {{ p === 'google' ? 'Google' : 'Facebook' }}</span>
              </button>
            }
          </div>
          <div class="flex items-center gap-2 text-[11px] text-[var(--c-dim)]" aria-hidden="true">
            <span class="h-px flex-1 bg-[var(--c-border)]"></span>ou com código por e-mail<span class="h-px flex-1 bg-[var(--c-border)]"></span>
          </div>
        }

        @if (!codeSent()) {
          <form class="flex items-start gap-2 flex-wrap" novalidate (submit)="$event.preventDefault(); sendCode()">
            <div class="flex flex-col gap-1">
              <label for="login-email" class="text-[11px] font-mono text-[var(--c-muted)]">E-mail</label>
              <input
                id="login-email"
                name="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                required
                placeholder="seu@email.com"
                class="h-8 px-2.5 rounded-[4px] text-xs font-mono w-64 max-w-full"
                style="background: rgba(var(--ov), .06); color: var(--c-text);"
                [style.border]="error() ? '1px solid var(--c-err)' : '1px solid rgba(var(--ov), .15)'"
                [attr.aria-invalid]="!!error()"
                [attr.aria-describedby]="'login-err'"
                [disabled]="busy()"
                [ngModel]="email()"
                (ngModelChange)="email.set($event); error.set('')" />
            </div>
            <button
              type="submit"
              class="h-8 self-end px-3 rounded-[4px] text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: rgba(246,188,3,.16); border: 1px solid #f1a10b; color: var(--c-acc);"
              [disabled]="busy()">
              {{ busy() ? 'enviando...' : 'enviar código' }}
            </button>
          </form>
        } @else {
          <form class="flex items-start gap-2 flex-wrap" novalidate (submit)="$event.preventDefault(); verifyCode()">
            <div class="flex flex-col gap-1">
              <label for="login-code" class="text-[11px] font-mono text-[var(--c-muted)]">
                Código enviado para {{ email() }}
              </label>
              <input
                id="login-code"
                name="code"
                inputmode="numeric"
                autocomplete="one-time-code"
                maxlength="8"
                required
                placeholder="000000"
                class="h-8 px-2.5 rounded-[4px] text-xs font-mono w-40 tracking-widest"
                style="background: rgba(var(--ov), .06); color: var(--c-text);"
                [style.border]="error() ? '1px solid var(--c-err)' : '1px solid rgba(var(--ov), .15)'"
                [attr.aria-invalid]="!!error()"
                [attr.aria-describedby]="'login-err'"
                [disabled]="busy()"
                [ngModel]="code()"
                (ngModelChange)="code.set(onlyDigits($event)); error.set('')" />
            </div>
            <button
              type="submit"
              class="h-8 self-end px-3 rounded-[4px] text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: rgba(246,188,3,.16); border: 1px solid #f1a10b; color: var(--c-acc);"
              [disabled]="busy()">
              {{ busy() ? 'verificando...' : 'entrar' }}
            </button>
            <button
              type="button"
              class="h-8 self-end px-3 rounded-[4px] text-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .18); color: var(--c-text);"
              [disabled]="busy() || cooldown() > 0"
              (click)="sendCode()">
              {{ cooldown() > 0 ? 'reenviar em ' + cooldown() + 's' : 'reenviar código' }}
            </button>
            <button
              type="button"
              class="h-8 self-end px-2 text-xs cursor-pointer underline"
              style="color: var(--c-link);"
              [disabled]="busy()"
              (click)="changeEmail()">
              trocar e-mail
            </button>
          </form>
        }

        <p id="login-err" class="text-xs min-h-[16px]" style="color: var(--c-err);" role="alert">{{ error() }}</p>
      </section>
    } @else {
      <div class="flex items-center justify-between gap-3 text-xs text-[var(--c-muted)]">
        <span>Logado como <strong class="text-[var(--c-text)]">{{ auth.session()?.email || 'usuário' }}</strong></span>
        <button
          type="button"
          class="h-7 px-3 rounded-[4px] text-xs cursor-pointer"
          style="background: rgba(var(--ov), .06); border: 1px solid rgba(var(--ov), .18); color: var(--c-text);"
          (click)="auth.signOut()">
          sair
        </button>
      </div>
    }
  `,
})
export class LoginPanelComponent {
  readonly auth = inject(SupabaseService);

  readonly email = signal('');
  readonly code = signal('');
  readonly codeSent = signal(false);
  readonly busy = signal(false);
  readonly error = signal('');
  readonly cooldown = signal(0);
  private cooldownTimer: ReturnType<typeof setInterval> | null = null;

  title(): string {
    return 'Entrar no painel';
  }

  onlyDigits(v: string): string {
    return digitsOnly(v);
  }

  async oauth(provider: OAuthProvider): Promise<void> {
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.startOAuth(provider); // redireciona; só volta aqui em caso de erro
    } catch (err) {
      this.error.set((err as Error).message);
      this.busy.set(false);
    }
  }

  async sendCode(): Promise<void> {
    if (this.busy()) return;
    const email = this.email().trim().toLowerCase();
    if (!isEmail(email)) {
      this.error.set('Informe um e-mail válido, como nome@empresa.com');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.sendLoginCode(email);
      this.email.set(email);
      this.codeSent.set(true);
      this.code.set('');
      this.startCooldown();
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.busy.set(false);
    }
  }

  async verifyCode(): Promise<void> {
    if (this.busy()) return;
    const code = this.code();
    if (code.length < 6) {
      this.error.set('O código tem de 6 a 8 dígitos, conforme o e-mail recebido');
      return;
    }
    this.busy.set(true);
    this.error.set('');
    try {
      await this.auth.verifyLoginCode(this.email().trim(), code);
      this.code.set('');
      this.codeSent.set(false);
    } catch (err) {
      this.error.set((err as Error).message);
    } finally {
      this.busy.set(false);
    }
  }

  changeEmail(): void {
    this.codeSent.set(false);
    this.code.set('');
    this.error.set('');
  }

  private startCooldown(): void {
    if (this.cooldownTimer) clearInterval(this.cooldownTimer);
    this.cooldown.set(RESEND_SECONDS);
    this.cooldownTimer = setInterval(() => {
      this.cooldown.update((n) => Math.max(0, n - 1));
      if (this.cooldown() === 0 && this.cooldownTimer) {
        clearInterval(this.cooldownTimer);
        this.cooldownTimer = null;
      }
    }, 1000);
  }
}
