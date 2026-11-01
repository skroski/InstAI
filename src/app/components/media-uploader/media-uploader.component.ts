import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostFormat, PostMedia } from '../../data/seed-data';
import { MediaUploadService } from '../../services/media-upload.service';

@Component({
  selector: 'app-media-uploader',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex flex-col gap-3 w-full">
      <!-- Dica sobre o formato ativo -->
      <div
        class="flex items-center justify-between text-[11.5px] py-1.5 px-2.5 rounded-[4px]"
        style="background: rgba(var(--ov), .05); border: 1px solid rgba(var(--ov), .1);"
      >
        <span class="flex items-center gap-1.5 font-medium" style="color: var(--c-acc);">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--c-acc)]"></span>
          Formato: {{ formatLabel(format()) }}
        </span>
        <span class="text-[11px]" style="color: var(--c-muted);">
          {{ formatTip(format()) }}
        </span>
      </div>

      <!-- Pré-visualização da mídia ativa / carrossel -->
      @if (mediaList().length > 0) {
        <div class="flex flex-col gap-2">
          <!-- Viewer principal com aspect ratio adequado -->
          <div
            class="relative rounded-[8px] overflow-hidden flex items-center justify-center bg-black/60 border border-[rgba(var(--ov),.15)] group"
            [ngClass]="aspectRatioClass(activeMedia()?.aspectRatio || '4:5', format())"
          >
            @if (activeMedia(); as media) {
              @if (media.type === 'video') {
                <video
                  [src]="media.url"
                  controls
                  playsinline
                  class="w-full h-full object-contain"
                ></video>
                <div
                  class="absolute top-2 left-2 px-2 py-0.5 rounded-[3px] text-[10px] font-mono uppercase bg-black/80 text-[var(--c-acc)] border border-[rgba(var(--ov),.2)] pointer-events-none"
                >
                  ▶ Vídeo · {{ media.aspectRatio || '9:16' }}
                </div>
              } @else {
                <img
                  [src]="media.url"
                  [alt]="media.name"
                  class="w-full h-full object-cover"
                />
                <div
                  class="absolute top-2 left-2 px-2 py-0.5 rounded-[3px] text-[10px] font-mono uppercase bg-black/80 text-[var(--c-text)] border border-[rgba(var(--ov),.2)] pointer-events-none"
                >
                  📷 Imagem · {{ media.aspectRatio || '4:5' }}
                </div>
              }

              <!-- Botão de remover mídia ativa -->
              <button
                type="button"
                title="Remover mídia"
                class="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer border border-white/25 transition-all shadow-md hover:scale-110 active:scale-95"
                (click)="onRemoveMedia(media.id)"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>

              <!-- Navegação do carrossel (quando há mais de 1 mídia) -->
              @if (mediaList().length > 1) {
                <button
                  type="button"
                  title="Slide anterior"
                  class="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center text-xs cursor-pointer border border-white/20"
                  (click)="prevSlide()"
                >
                  ‹
                </button>
                <button
                  type="button"
                  title="Próximo slide"
                  class="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/70 hover:bg-black/90 text-white flex items-center justify-center text-xs cursor-pointer border border-white/20"
                  (click)="nextSlide()"
                >
                  ›
                </button>
                <div
                  class="absolute bottom-2 left-1/2 -translate-y-0 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/80 text-[10.5px] font-mono text-white/90 border border-white/10"
                >
                  {{ activeIndex() + 1 }} / {{ mediaList().length }}
                </div>
              }
            }
          </div>

          <!-- Carrossel de Miniaturas -->
          @if (mediaList().length > 1 || format() === 'CAROUSEL') {
            <div class="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
              @for (m of mediaList(); track m.id; let idx = $index) {
                <div
                  class="relative shrink-0 w-14 h-14 rounded-[4px] overflow-hidden cursor-pointer border transition-all"
                  [style.border-color]="activeIndex() === idx ? 'var(--c-acc)' : 'rgba(var(--ov), .2)'"
                  [style.box-shadow]="activeIndex() === idx ? '0 0 0 1px var(--c-acc)' : 'none'"
                  (click)="activeIndex.set(idx)"
                >
                  @if (m.type === 'video') {
                    <img
                      [src]="m.thumbnailUrl || m.url"
                      alt="Thumbnail do vídeo"
                      class="w-full h-full object-cover"
                    />
                    <div
                      class="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] text-white"
                    >
                      ▶
                    </div>
                  } @else {
                    <img [src]="m.url" [alt]="m.name" class="w-full h-full object-cover" />
                  }
                  <span
                    class="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-black/80 text-[9px] font-mono text-white flex items-center justify-center"
                  >
                    {{ idx + 1 }}
                  </span>
                  <button
                    type="button"
                    title="Remover miniatura"
                    class="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center cursor-pointer transition-transform hover:scale-110 shadow-sm"
                    (click)="$event.stopPropagation(); onRemoveMedia(m.id)"
                  >
                    <svg class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      }

      <!-- Dropzone de Upload e Inserção -->
      @if (canAddMore()) {
        <div
          class="border-2 border-dashed rounded-[8px] p-3.5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all"
          [style.border-color]="isDragging() ? 'var(--c-acc)' : 'rgba(var(--ov), .2)'"
          [style.background]="isDragging() ? 'rgba(246,188,3,.08)' : 'rgba(var(--ov), .02)'"
          (dragover)="onDragOver($event)"
          (dragleave)="isDragging.set(false)"
          (drop)="onDrop($event)"
          (click)="fileInput.click()"
        >
          <input
            #fileInput
            type="file"
            class="hidden"
            [multiple]="format() === 'CAROUSEL'"
            [accept]="acceptedMimeTypes(format())"
            (change)="onFileSelected($event)"
          />

          @if (isProcessing()) {
            <div class="flex items-center gap-2 text-[12px]" style="color: var(--c-acc);">
              <span class="loading loading-spinner loading-xs"></span>
              <span>Processando mídia localmente...</span>
            </div>
          } @else {
            <div class="flex items-center gap-2 text-[13px] font-medium" style="color: var(--c-text);">
              <span class="text-[16px]">📁</span>
              <span>
                {{ mediaList().length === 0 ? 'Clique para selecionar ou arraste aqui' : '+ Adicionar mais fotos ou vídeos' }}
              </span>
            </div>
            <div class="text-[11px] text-center" style="color: var(--c-muted);">
              @if (format() === 'REELS') {
                Vídeo MP4 ou MOV até 100MB (9:16 vertical)
              } @else if (format() === 'CAROUSEL') {
                Até 10 fotos ou vídeos (JPG, PNG, WEBP, MP4)
              } @else if (format() === 'STORIES') {
                Foto ou vídeo vertical 9:16
              } @else {
                Foto (JPG, PNG, WEBP) ou vídeo (MP4) para o Feed
              }
            </div>
          }
        </div>

        <!-- Opção alternativa: Inserir via URL direta -->
        <div class="flex items-center gap-1.5 pt-1">
          <input
            type="text"
            class="flex-1 px-2.5 py-1.5 rounded-[4px] text-[12px] bg-[var(--c-bg-elev)] border border-[rgba(var(--ov),.15)] text-[var(--c-text)] cm-input-focus"
            placeholder="Ou cole o link de uma imagem ou vídeo público..."
            [(ngModel)]="urlInput"
            (keydown.enter)="addFromUrl()"
          />
          <button
            type="button"
            class="h-[30px] px-3 rounded-[4px] text-[11.5px] cursor-pointer bg-[rgba(var(--ov),.08)] border border-[rgba(var(--ov),.2)] text-[var(--c-text)] hover:bg-[rgba(var(--ov),.14)]"
            (click)="addFromUrl()"
          >
            Adicionar URL
          </button>
        </div>
      }
    </div>
  `,
})
export class MediaUploaderComponent {
  private readonly uploadService = inject(MediaUploadService);

  readonly mediaList = input<PostMedia[]>([]);
  readonly format = input<PostFormat>('IMAGE');
  readonly compact = input<boolean>(false);

  readonly mediaChange = output<PostMedia[]>();
  readonly mediaAdded = output<PostMedia[]>();
  readonly mediaRemoved = output<string>();

  readonly activeIndex = signal<number>(0);
  readonly isDragging = signal<boolean>(false);
  readonly isProcessing = signal<boolean>(false);
  urlInput = '';

  activeMedia() {
    const list = this.mediaList();
    if (!list.length) return null;
    const idx = Math.min(this.activeIndex(), list.length - 1);
    return list[Math.max(0, idx)];
  }

  canAddMore(): boolean {
    const fmt = this.format();
    const count = this.mediaList().length;
    if (fmt === 'CAROUSEL') return count < 10;
    return count === 0;
  }

  nextSlide(): void {
    const len = this.mediaList().length;
    if (len <= 1) return;
    this.activeIndex.update((i) => (i + 1) % len);
  }

  prevSlide(): void {
    const len = this.mediaList().length;
    if (len <= 1) return;
    this.activeIndex.update((i) => (i - 1 + len) % len);
  }

  onDragOver(e: DragEvent): void {
    e.preventDefault();
    this.isDragging.set(true);
  }

  async onDrop(e: DragEvent): Promise<void> {
    e.preventDefault();
    this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      await this.handleFiles(Array.from(files));
    }
  }

  async onFileSelected(e: Event): Promise<void> {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      await this.handleFiles(Array.from(input.files));
      input.value = '';
    }
  }

  private async handleFiles(files: File[]): Promise<void> {
    this.isProcessing.set(true);
    try {
      const allowedCount = this.format() === 'CAROUSEL' ? 10 - this.mediaList().length : 1;
      const toProcess = files.slice(0, allowedCount);
      const processed: PostMedia[] = [];

      for (const f of toProcess) {
        const item = await this.uploadService.processFile(f, this.format());
        processed.push(item);
      }

      if (processed.length > 0) {
        this.mediaAdded.emit(processed);
        this.mediaChange.emit([...this.mediaList(), ...processed]);
        this.activeIndex.set(this.mediaList().length + processed.length - 1);
      }
    } catch (err) {
      console.error('Erro ao processar arquivo(s):', err);
    } finally {
      this.isProcessing.set(false);
    }
  }

  addFromUrl(): void {
    const url = this.urlInput.trim();
    if (!url) return;
    const media = this.uploadService.createMediaFromUrl(url, undefined, undefined, this.format());
    this.mediaAdded.emit([media]);
    this.mediaChange.emit([...this.mediaList(), media]);
    this.urlInput = '';
    this.activeIndex.set(this.mediaList().length);
  }

  onRemoveMedia(mediaId: string): void {
    this.mediaRemoved.emit(mediaId);
    const nextList = this.mediaList().filter((m) => m.id !== mediaId);
    this.mediaChange.emit(nextList);
    if (this.activeIndex() >= nextList.length) {
      this.activeIndex.set(Math.max(0, nextList.length - 1));
    }
  }

  acceptedMimeTypes(format: PostFormat): string {
    if (format === 'REELS') return 'video/mp4,video/quicktime,video/webm';
    return 'image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm';
  }

  aspectRatioClass(ar: string, format: PostFormat): string {
    if (format === 'REELS' || format === 'STORIES') {
      return 'aspect-[9/16] max-h-[360px] mx-auto';
    }
    if (ar === '1:1') {
      return 'aspect-square max-h-[300px] mx-auto';
    }
    return 'aspect-[4/5] max-h-[320px] mx-auto';
  }

  formatLabel(f: PostFormat): string {
    const map: Record<PostFormat, string> = {
      IMAGE: 'Feed (Foto Única)',
      CAROUSEL: 'Carrossel (Múltiplas Fotos/Vídeos)',
      REELS: 'Reels (Vídeo Vertical)',
      STORIES: 'Stories (Foto ou Vídeo 9:16)',
    };
    return map[f] || f;
  }

  formatTip(f: PostFormat): string {
    const map: Record<PostFormat, string> = {
      IMAGE: 'Recomendado 4:5 (1080x1350) ou 1:1',
      CAROUSEL: '2 a 10 fotos ou vídeos em 4:5 ou 1:1',
      REELS: 'Vídeo 9:16 (1080x1920) até 90s',
      STORIES: 'Foto ou vídeo 9:16 (1080x1920)',
    };
    return map[f] || '';
  }
}

