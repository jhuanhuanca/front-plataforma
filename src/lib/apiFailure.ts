import { ref } from 'vue'

export const apiFailure = ref<string | null>(null)

export function reportApiFailure(requestId: string): void {
  apiFailure.value = requestId
}

export function clearApiFailure(): void {
  apiFailure.value = null
}
