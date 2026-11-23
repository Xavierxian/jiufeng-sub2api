<script setup lang="ts">
import { ref } from "vue";
import type { GroupPlatform } from "@/types";
import ReasoningEffortPolicyFields from "@/components/admin/group/ReasoningEffortPolicyFields.vue";
import type { ReasoningEffortMappingRow } from "@/views/admin/groupsReasoningEffort";

// Keep the Jiufeng import path working while sharing the v0.2 implementation.
defineOptions({ inheritAttrs: false });

const props = defineProps<{
  idPrefix: string;
  platform: GroupPlatform;
  maxEffort: string;
  overLimit: string;
  mappings: ReasoningEffortMappingRow[];
}>();

const emit = defineEmits<{
  (event: "update:maxEffort", value: string): void;
  (event: "update:overLimit", value: string): void;
  (event: "update:mappings", value: ReasoningEffortMappingRow[]): void;
}>();

type PolicyFieldsExpose = {
  validate?: () => boolean;
  resetValidation?: () => void;
};

const child = ref<PolicyFieldsExpose | null>(null);

defineExpose({
  validate: () => child.value?.validate?.() ?? false,
  resetValidation: () => child.value?.resetValidation?.(),
});
</script>

<template>
  <ReasoningEffortPolicyFields
    ref="child"
    :id-prefix="props.idPrefix"
    :platform="props.platform"
    :max-effort="props.maxEffort"
    :over-limit="props.overLimit"
    :mappings="props.mappings"
    @update:max-effort="emit('update:maxEffort', $event)"
    @update:over-limit="emit('update:overLimit', $event)"
    @update:mappings="emit('update:mappings', $event)"
  />
</template>
