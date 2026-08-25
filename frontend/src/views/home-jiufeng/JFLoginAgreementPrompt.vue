<template>
  <div
    v-if="showInlineControl && mode === 'checkbox' && documents.length > 0"
    class="jf-agreement-checkbox"
  >
    <input
      id="jf-login-agreement-consent"
      type="checkbox"
      :checked="accepted"
      @change="handleCheckboxChange"
    />
    <label for="jf-login-agreement-consent">
      {{ t('legal.loginAgreementPrompt.checkboxPrefix') }}
      <template v-for="(doc, index) in documents" :key="doc.id || doc.title">
        <button
          type="button"
          class="jf-agreement-checkbox__document"
          @click.prevent="openDocument(doc)"
        >
          {{ doc.title }}
        </button>
        <span v-if="index < documents.length - 1">
          {{ t('legal.loginAgreementPrompt.documentSeparator') }}
        </span>
      </template>
    </label>
  </div>

  <div
    v-else-if="showInlineControl && !accepted && documents.length > 0"
    class="jf-agreement-notice"
  >
    <span class="jf-agreement-notice__icon">
      <Icon name="shield" size="sm" />
    </span>
    <div class="jf-agreement-notice__copy">
      <strong>{{ t('legal.loginAgreementPrompt.noticeTitle') }}</strong>
      <span>{{ t('legal.loginAgreementPrompt.noticeDescription') }}</span>
    </div>
    <button type="button" @click="emit('open')">
      {{ t('legal.loginAgreementPrompt.viewTerms') }}
      <Icon name="arrowRight" size="xs" />
    </button>
  </div>

  <Teleport to="body">
    <Transition name="jf-agreement-dialog">
      <div
        v-if="dialogVisible"
        class="jf-agreement-overlay"
        @keydown="handleDialogKeydown"
      >
        <section
          ref="dialogRef"
          class="jf-agreement-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jf-agreement-dialog-title"
          aria-describedby="jf-agreement-dialog-description"
          :aria-hidden="selectedDocument ? 'true' : undefined"
          :inert="Boolean(selectedDocument)"
          tabindex="-1"
        >
          <header class="jf-agreement-dialog__header">
            <span class="jf-agreement-dialog__mark" aria-hidden="true">
              <Icon name="shield" size="lg" />
            </span>
            <div class="jf-agreement-dialog__heading">
              <div class="jf-agreement-dialog__title-row">
                <h2 id="jf-agreement-dialog-title">
                  {{ t('legal.loginAgreementPrompt.dialogTitle') }}
                </h2>
                <span class="jf-agreement-dialog__date">
                  <Icon name="calendar" size="xs" />
                  {{ updatedAt || t('legal.loginAgreementPrompt.recently') }}
                </span>
              </div>
              <p id="jf-agreement-dialog-description">
                {{
                  t('legal.loginAgreementPrompt.dialogDescription', {
                    date: updatedAt || t('legal.loginAgreementPrompt.recently'),
                  })
                }}
              </p>
            </div>
          </header>

          <div class="jf-agreement-dialog__body">
            <div class="jf-agreement-dialog__section-title">
              <span>{{ t('legal.loginAgreementPrompt.relatedDocuments') }}</span>
              <span>{{ documents.length }}</span>
            </div>

            <nav
              class="jf-agreement-documents"
              :aria-label="t('legal.loginAgreementPrompt.relatedDocuments')"
            >
              <button
                v-for="(doc, index) in documents"
                :key="doc.id || doc.title"
                type="button"
                class="jf-agreement-document"
                @click="openDocument(doc)"
              >
                <span class="jf-agreement-document__icon" aria-hidden="true">
                  <Icon :name="documentIcon(index, doc.title)" size="sm" />
                </span>
                <span class="jf-agreement-document__title">{{ doc.title }}</span>
                <span class="jf-agreement-document__action" aria-hidden="true">
                  <Icon name="chevronRight" size="sm" />
                </span>
              </button>
            </nav>
          </div>

          <footer class="jf-agreement-dialog__footer">
            <button
              type="button"
              class="jf-agreement-button jf-agreement-button--secondary"
              @click="emit('reject')"
            >
              {{ t('legal.loginAgreementPrompt.reject') }}
            </button>
            <button
              ref="acceptButtonRef"
              type="button"
              class="jf-agreement-button jf-agreement-button--primary"
              @click="emit('accept')"
            >
              <Icon name="check" size="sm" />
              {{ t('legal.loginAgreementPrompt.accept') }}
            </button>
          </footer>
        </section>
      </div>
    </Transition>

    <Transition name="jf-agreement-document-dialog">
      <div
        v-if="selectedDocument"
        class="jf-agreement-document-overlay"
        @mousedown.self="closeDocument"
        @keydown.stop="handleDocumentDialogKeydown"
      >
        <article
          ref="documentDialogRef"
          class="jf-agreement-document-dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="jf-agreement-document-title"
          tabindex="-1"
        >
          <header class="jf-agreement-document-dialog__header">
            <span class="jf-agreement-document-dialog__mark" aria-hidden="true">
              <Icon :name="selectedDocumentIcon" size="md" />
            </span>
            <div class="jf-agreement-document-dialog__heading">
              <span>{{ t('legal.loginAgreement') }}</span>
              <h2 id="jf-agreement-document-title">{{ selectedDocument.title }}</h2>
              <p v-if="updatedAt">
                <Icon name="calendar" size="xs" />
                {{ t('legal.updatedAt', { date: updatedAt }) }}
              </p>
            </div>
            <button
              ref="documentCloseButtonRef"
              type="button"
              class="jf-agreement-document-dialog__close"
              :aria-label="t('common.close')"
              :title="t('common.close')"
              @click="closeDocument"
            >
              <Icon name="x" size="md" />
            </button>
          </header>

          <div class="jf-agreement-document-dialog__content">
            <div
              v-if="renderedDocumentHtml"
              class="jf-agreement-markdown"
              v-html="renderedDocumentHtml"
            ></div>
            <div v-else class="jf-agreement-document-dialog__empty">
              <Icon name="document" size="lg" />
              <span>{{ t('legal.empty') }}</span>
            </div>
          </div>

          <footer class="jf-agreement-document-dialog__footer">
            <button type="button" @click="closeDocument">
              <Icon name="arrowLeft" size="sm" />
              {{ t('common.back') }}
            </button>
          </footer>
        </article>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import Icon from '@/components/icons/Icon.vue'
import type { LoginAgreementDocument } from '@/types'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  accepted: boolean
  documents: LoginAgreementDocument[]
  mode: 'modal' | 'checkbox' | string
  updatedAt?: string
  visible: boolean
  showInlineControl?: boolean
}>(), {
  updatedAt: '',
  showInlineControl: true,
})

const emit = defineEmits<{
  accept: []
  reject: []
  open: []
}>()

const dialogRef = ref<HTMLElement | null>(null)
const acceptButtonRef = ref<HTMLButtonElement | null>(null)
const documentDialogRef = ref<HTMLElement | null>(null)
const documentCloseButtonRef = ref<HTMLButtonElement | null>(null)
const selectedDocument = ref<LoginAgreementDocument | null>(null)
const documents = computed(() => props.documents.filter((doc) => doc.title.trim()))
const updatedAt = computed(() => props.updatedAt || '')
const accepted = computed(() => props.accepted)
const mode = computed(() => props.mode === 'checkbox' ? 'checkbox' : 'modal')
const dialogVisible = computed(() => props.visible && documents.value.length > 0)
const showInlineControl = computed(() => props.showInlineControl)
const modalActive = computed(() => dialogVisible.value || Boolean(selectedDocument.value))
const renderedDocumentHtml = computed(() => {
  const content = selectedDocument.value?.content_md?.trim() || ''
  return content ? DOMPurify.sanitize(marked.parse(content) as string) : ''
})
const selectedDocumentIcon = computed(() => {
  const document = selectedDocument.value
  if (!document) {
    return 'document' as const
  }
  const index = documents.value.findIndex((item) => item === document || item.id === document.id)
  return documentIcon(Math.max(index, 0), document.title)
})

let overflowBeforeDialog: string | null = null
let previouslyFocusedElement: HTMLElement | null = null

watch(modalActive, async (visible) => {
  if (visible) {
    previouslyFocusedElement = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    if (overflowBeforeDialog === null) {
      overflowBeforeDialog = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    await nextTick()
    acceptButtonRef.value?.focus()
    return
  }

  restorePageState()
}, { immediate: true })

onUnmounted(restorePageState)

function restorePageState(): void {
  if (overflowBeforeDialog !== null) {
    document.body.style.overflow = overflowBeforeDialog
    overflowBeforeDialog = null
  }
  if (previouslyFocusedElement?.isConnected) {
    previouslyFocusedElement.focus()
  }
  previouslyFocusedElement = null
}

function handleCheckboxChange(event: Event): void {
  const checked = (event.target as HTMLInputElement).checked
  if (checked) {
    emit('accept')
  } else {
    emit('reject')
  }
}

function handleDialogKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    emit('reject')
    return
  }
  if (event.key !== 'Tab' || !dialogRef.value) {
    return
  }

  const focusableElements = Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
  if (focusableElements.length === 0) {
    event.preventDefault()
    dialogRef.value.focus()
    return
  }

  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

async function openDocument(document: LoginAgreementDocument): Promise<void> {
  selectedDocument.value = document
  await nextTick()
  documentCloseButtonRef.value?.focus()
}

async function closeDocument(): Promise<void> {
  selectedDocument.value = null
  await nextTick()
  if (dialogVisible.value) {
    dialogRef.value?.focus()
  }
}

function handleDocumentDialogKeydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    event.preventDefault()
    void closeDocument()
    return
  }
  if (event.key === 'Tab') {
    trapFocus(event, documentDialogRef.value)
  }
}

function trapFocus(event: KeyboardEvent, container: HTMLElement | null): void {
  if (!container) return
  const focusableElements = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  )
  if (focusableElements.length === 0) {
    event.preventDefault()
    container.focus()
    return
  }
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault()
    lastElement.focus()
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault()
    firstElement.focus()
  }
}

defineExpose({ openDocument })

function documentIcon(index: number, title: string): 'document' | 'shield' | 'globe' | 'cog' {
  const normalizedTitle = title.toLowerCase()
  if (normalizedTitle.includes('policy') || normalizedTitle.includes('privacy') || index === 1) {
    return 'shield'
  }
  if (normalizedTitle.includes('country') || normalizedTitle.includes('region') || index === 2) {
    return 'globe'
  }
  if (index === 3) {
    return 'cog'
  }
  return 'document'
}
</script>

<style scoped>
.jf-agreement-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #616161;
  font-size: 12px;
  line-height: 1.6;
}

.jf-agreement-checkbox input {
  width: 17px;
  height: 17px;
  margin: 2px 0 0;
  flex: 0 0 auto;
  accent-color: #111111;
}

.jf-agreement-checkbox label {
  min-width: 0;
}

.jf-agreement-checkbox__document {
  display: inline;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: #151515;
  font: inherit;
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.jf-agreement-checkbox__document:hover,
.jf-agreement-checkbox__document:focus-visible {
  color: #087f70;
}

.jf-agreement-notice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 13px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  color: #171717;
}

.jf-agreement-notice__icon {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 1px solid #d9eeea;
  border-radius: 8px;
  background: #eef8f6;
  color: #0e8f7e;
}

.jf-agreement-notice__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.jf-agreement-notice__copy strong {
  font-size: 12px;
  font-weight: 800;
}

.jf-agreement-notice__copy span {
  color: #747474;
  font-size: 11px;
  line-height: 1.45;
}

.jf-agreement-notice button {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 7px 9px;
  border: 0;
  background: transparent;
  color: #111111;
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

.jf-agreement-overlay {
  position: fixed;
  z-index: 140;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 28px;
  background: rgba(17, 24, 39, .42);
  backdrop-filter: blur(8px);
}

.jf-agreement-dialog {
  width: min(100%, 680px);
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, .12);
  border-radius: 18px;
  outline: 0;
  background: #ffffff;
  color: #171717;
  box-shadow: 0 28px 72px rgba(17, 24, 39, .2);
  font-family: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.jf-agreement-dialog__header {
  display: flex;
  align-items: flex-start;
  gap: 18px;
  padding: 28px 30px 25px;
  border-bottom: 1px solid #ededed;
}

.jf-agreement-dialog__mark {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid #d7ebe7;
  border-radius: 12px;
  background: #edf8f6;
  color: #0b8f7e;
}

.jf-agreement-dialog__heading {
  min-width: 0;
  flex: 1;
}

.jf-agreement-dialog__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.jf-agreement-dialog__title-row h2 {
  margin: 0;
  color: #111111;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 24px;
  font-weight: 950;
  line-height: 1.25;
  letter-spacing: 0;
}

.jf-agreement-dialog__date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: 7px;
  background: #f3f4f6;
  color: #667085;
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
}

.jf-agreement-dialog__heading p {
  margin: 11px 0 0;
  color: #667085;
  font-size: 13px;
  line-height: 1.75;
}

.jf-agreement-dialog__body {
  padding: 23px 30px 27px;
}

.jf-agreement-dialog__section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 11px;
  color: #344054;
  font-size: 12px;
  font-weight: 800;
}

.jf-agreement-dialog__section-title span:last-child {
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  border-radius: 50%;
  background: #f2f4f7;
  color: #667085;
  font-size: 10px;
}

.jf-agreement-documents {
  display: grid;
  overflow: hidden;
  border: 1px solid #e4e7ec;
  border-radius: 10px;
  background: #ffffff;
}

.jf-agreement-document {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 13px;
  min-height: 58px;
  width: 100%;
  padding: 10px 14px;
  border: 0;
  background: #ffffff;
  color: #1d2939;
  font-family: inherit;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
  transition: background .18s ease, color .18s ease;
}

.jf-agreement-document + .jf-agreement-document {
  border-top: 1px solid #eaecf0;
}

.jf-agreement-document:hover,
.jf-agreement-document:focus-visible {
  outline: 0;
  background: #f5faf9;
  color: #087f70;
}

.jf-agreement-document__icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border: 1px solid #e4e7ec;
  border-radius: 8px;
  background: #fafafa;
  color: #475467;
}

.jf-agreement-document__title {
  overflow: hidden;
  font-size: 13px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.jf-agreement-document__action {
  color: #98a2b3;
}

.jf-agreement-dialog__footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.25fr);
  gap: 12px;
  padding: 18px 30px 22px;
  border-top: 1px solid #ededed;
  background: #fafafa;
}

.jf-agreement-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 46px;
  padding: 0 20px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 850;
  cursor: pointer;
  transition: transform .18s ease, background .18s ease, border-color .18s ease;
}

.jf-agreement-button:hover {
  transform: translateY(-1px);
}

.jf-agreement-button:focus-visible {
  outline: 3px solid rgba(14, 159, 140, .22);
  outline-offset: 2px;
}

.jf-agreement-button--secondary {
  border: 1px solid #d0d5dd;
  background: #ffffff;
  color: #344054;
}

.jf-agreement-button--secondary:hover {
  border-color: #98a2b3;
  background: #f5f5f5;
}

.jf-agreement-button--primary {
  border: 1px solid #111111;
  background: #111111;
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(17, 17, 17, .14);
}

.jf-agreement-button--primary:hover {
  background: #242424;
}

.jf-agreement-document-overlay {
  position: fixed;
  z-index: 160;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  background: rgba(17, 24, 39, .58);
  backdrop-filter: blur(10px);
}

.jf-agreement-document-dialog {
  display: flex;
  width: min(100%, 780px);
  max-height: min(84vh, 780px);
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, .14);
  border-radius: 16px;
  outline: 0;
  background: #ffffff;
  color: #1d2939;
  box-shadow: 0 30px 88px rgba(17, 24, 39, .26);
  font-family: Inter, "Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.jf-agreement-document-dialog__header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: flex-start;
  gap: 15px;
  flex: 0 0 auto;
  padding: 22px 24px;
  border-bottom: 1px solid #eaecf0;
}

.jf-agreement-document-dialog__mark {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border: 1px solid #d7ebe7;
  border-radius: 10px;
  background: #edf8f6;
  color: #0b8f7e;
}

.jf-agreement-document-dialog__heading {
  min-width: 0;
}

.jf-agreement-document-dialog__heading > span {
  color: #0b8f7e;
  font-size: 11px;
  font-weight: 800;
}

.jf-agreement-document-dialog__heading h2 {
  margin: 3px 0 0;
  overflow-wrap: anywhere;
  color: #111111;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-size: 22px;
  font-weight: 950;
  line-height: 1.35;
  letter-spacing: 0;
}

.jf-agreement-document-dialog__heading p {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 7px 0 0;
  color: #98a2b3;
  font-size: 11px;
}

.jf-agreement-document-dialog__close {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border: 1px solid #e4e7ec;
  border-radius: 50%;
  background: #ffffff;
  color: #667085;
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, color .18s ease;
}

.jf-agreement-document-dialog__close:hover,
.jf-agreement-document-dialog__close:focus-visible {
  border-color: #d0d5dd;
  outline: 0;
  background: #f5f5f5;
  color: #111111;
}

.jf-agreement-document-dialog__content {
  min-height: 220px;
  flex: 1 1 auto;
  overflow-y: auto;
  padding: 24px 28px 34px;
  overscroll-behavior: contain;
}

.jf-agreement-document-dialog__empty {
  display: flex;
  min-height: 260px;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 12px;
  border: 1px dashed #d0d5dd;
  border-radius: 10px;
  background: #fafafa;
  color: #98a2b3;
  font-size: 13px;
}

.jf-agreement-document-dialog__footer {
  display: flex;
  flex: 0 0 auto;
  justify-content: flex-end;
  padding: 14px 24px 18px;
  border-top: 1px solid #eaecf0;
  background: #fafafa;
}

.jf-agreement-document-dialog__footer button {
  display: inline-flex;
  min-height: 40px;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 19px;
  border: 1px solid #111111;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  font-size: 12px;
  font-weight: 850;
  cursor: pointer;
}

.jf-agreement-markdown {
  color: #344054;
  font-size: 14px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}

.jf-agreement-markdown :deep(h1),
.jf-agreement-markdown :deep(h2),
.jf-agreement-markdown :deep(h3),
.jf-agreement-markdown :deep(h4) {
  color: #111111;
  font-family: "Noto Serif SC", "Songti SC", serif;
  font-weight: 900;
  letter-spacing: 0;
}

.jf-agreement-markdown :deep(h1) {
  margin: 0 0 22px;
  padding-bottom: 13px;
  border-bottom: 1px solid #eaecf0;
  font-size: 25px;
}

.jf-agreement-markdown :deep(h2) {
  margin: 28px 0 12px;
  font-size: 20px;
}

.jf-agreement-markdown :deep(h3) {
  margin: 23px 0 10px;
  font-size: 17px;
}

.jf-agreement-markdown :deep(h4) {
  margin: 20px 0 8px;
  font-size: 15px;
}

.jf-agreement-markdown :deep(p) {
  margin: 0 0 15px;
}

.jf-agreement-markdown :deep(a) {
  color: #087f70;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.jf-agreement-markdown :deep(ul),
.jf-agreement-markdown :deep(ol) {
  margin: 0 0 16px;
  padding-left: 24px;
}

.jf-agreement-markdown :deep(li) {
  margin-bottom: 5px;
}

.jf-agreement-markdown :deep(blockquote) {
  margin: 18px 0;
  padding: 2px 0 2px 15px;
  border-left: 3px solid #0e9f8c;
  color: #667085;
}

.jf-agreement-markdown :deep(code) {
  border-radius: 5px;
  background: #f2f4f7;
  padding: 2px 5px;
  font-family: Consolas, "SFMono-Regular", monospace;
  font-size: .9em;
}

.jf-agreement-markdown :deep(pre) {
  overflow-x: auto;
  margin: 18px 0;
  border-radius: 8px;
  background: #171717;
  padding: 15px;
  color: #f5f5f5;
}

.jf-agreement-markdown :deep(pre code) {
  background: transparent;
  padding: 0;
}

.jf-agreement-markdown :deep(table) {
  display: block;
  width: 100%;
  overflow-x: auto;
  margin: 18px 0;
  border-collapse: collapse;
}

.jf-agreement-markdown :deep(th),
.jf-agreement-markdown :deep(td) {
  border: 1px solid #d0d5dd;
  padding: 8px 10px;
  text-align: left;
}

.jf-agreement-markdown :deep(th) {
  background: #f9fafb;
}

.jf-agreement-markdown :deep(img) {
  max-width: 100%;
  height: auto;
}

.jf-agreement-dialog-enter-active,
.jf-agreement-dialog-leave-active {
  transition: opacity .2s ease;
}

.jf-agreement-dialog-enter-active .jf-agreement-dialog,
.jf-agreement-dialog-leave-active .jf-agreement-dialog {
  transition: transform .2s ease, opacity .2s ease;
}

.jf-agreement-dialog-enter-from,
.jf-agreement-dialog-leave-to {
  opacity: 0;
}

.jf-agreement-dialog-enter-from .jf-agreement-dialog,
.jf-agreement-dialog-leave-to .jf-agreement-dialog {
  opacity: 0;
  transform: translateY(10px) scale(.985);
}

.jf-agreement-document-dialog-enter-active,
.jf-agreement-document-dialog-leave-active {
  transition: opacity .18s ease;
}

.jf-agreement-document-dialog-enter-active .jf-agreement-document-dialog,
.jf-agreement-document-dialog-leave-active .jf-agreement-document-dialog {
  transition: transform .18s ease, opacity .18s ease;
}

.jf-agreement-document-dialog-enter-from,
.jf-agreement-document-dialog-leave-to {
  opacity: 0;
}

.jf-agreement-document-dialog-enter-from .jf-agreement-document-dialog,
.jf-agreement-document-dialog-leave-to .jf-agreement-document-dialog {
  opacity: 0;
  transform: translateY(8px) scale(.99);
}

@media (max-width: 640px) {
  .jf-agreement-notice {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .jf-agreement-notice button {
    grid-column: 2;
    width: fit-content;
    padding-left: 0;
  }

  .jf-agreement-overlay {
    align-items: flex-end;
    padding: 12px;
  }

  .jf-agreement-dialog {
    max-height: calc(100dvh - 24px);
    overflow-y: auto;
    border-radius: 16px;
  }

  .jf-agreement-dialog__header {
    gap: 13px;
    padding: 21px 18px 18px;
  }

  .jf-agreement-dialog__mark {
    width: 40px;
    height: 40px;
    border-radius: 10px;
  }

  .jf-agreement-dialog__title-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .jf-agreement-dialog__title-row h2 {
    font-size: 20px;
  }

  .jf-agreement-dialog__heading p {
    font-size: 12px;
    line-height: 1.65;
  }

  .jf-agreement-dialog__body {
    padding: 18px;
  }

  .jf-agreement-document {
    min-height: 54px;
    padding: 9px 11px;
  }

  .jf-agreement-dialog__footer {
    grid-template-columns: 1fr;
    padding: 15px 18px 18px;
  }

  .jf-agreement-button--primary {
    grid-row: 1;
  }

  .jf-agreement-document-overlay {
    align-items: flex-end;
    padding: 10px;
  }

  .jf-agreement-document-dialog {
    width: 100%;
    max-height: calc(100dvh - 20px);
    border-radius: 15px;
  }

  .jf-agreement-document-dialog__header {
    gap: 11px;
    padding: 17px 16px;
  }

  .jf-agreement-document-dialog__mark {
    width: 36px;
    height: 36px;
  }

  .jf-agreement-document-dialog__heading h2 {
    font-size: 19px;
  }

  .jf-agreement-document-dialog__content {
    padding: 20px 18px 28px;
  }

  .jf-agreement-document-dialog__footer {
    padding: 12px 16px 16px;
  }

  .jf-agreement-document-dialog__footer button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .jf-agreement-dialog-enter-active,
  .jf-agreement-dialog-leave-active,
  .jf-agreement-dialog-enter-active .jf-agreement-dialog,
  .jf-agreement-dialog-leave-active .jf-agreement-dialog,
  .jf-agreement-document-dialog-enter-active,
  .jf-agreement-document-dialog-leave-active,
  .jf-agreement-document-dialog-enter-active .jf-agreement-document-dialog,
  .jf-agreement-document-dialog-leave-active .jf-agreement-document-dialog,
  .jf-agreement-document,
  .jf-agreement-button {
    transition: none;
  }
}
</style>
