"use client";

import { Select } from "@heroui/react/select";
import { ListBox } from "@heroui/react/list-box";
import { Check, ChevronDown } from "lucide-react";

export function PracticeSelect({ value, disabled, label, placeholder, options, onChange }: {
  value: string;
  disabled: boolean;
  label: string;
  placeholder: string;
  options: { letter: string; text: string; disabled: boolean }[];
  onChange(value: string): void;
}) {
  return <Select className="practice-select" aria-label={label} isDisabled={disabled} selectedKey={value || null} onSelectionChange={key => onChange(key === '__clear' || key === null ? '' : String(key))} placeholder={placeholder}>
    <Select.Trigger><Select.Value /><Select.Indicator><ChevronDown aria-hidden="true" /></Select.Indicator></Select.Trigger>
    <Select.Popover className="practice-select-popover">
      <ListBox aria-label={label}>
        <ListBox.Item id="__clear" textValue={placeholder}>{placeholder}</ListBox.Item>
        {options.map(option => <ListBox.Item key={option.letter} id={option.letter} textValue={`${option.letter}. ${option.text}`} isDisabled={option.disabled}>
          <ListBox.ItemIndicator>{({ isSelected }) => isSelected ? <Check aria-hidden="true" /> : null}</ListBox.ItemIndicator>
          {option.letter}. {option.text}
        </ListBox.Item>)}
      </ListBox>
    </Select.Popover>
  </Select>;
}
