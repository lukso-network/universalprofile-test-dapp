import { Ref } from "vue";

export default function useDropdown(): {
  close: (dropdown: HTMLElement) => void;
  open: (dropdown: HTMLElement) => void;
  isOpen: (dropdown: HTMLElement) => boolean;
  toggle: (dropdown: HTMLElement) => void;
} {
  const close = (dropdown: HTMLElement) => {
    dropdown.classList.remove("is-active");
  };

  const open = (dropdown: HTMLElement) => {
    dropdown.classList.add("is-active");
  };

  const isOpen = (dropdown: HTMLElement) => {
    return dropdown.classList.contains("is-active");
  };

  const toggle = (dropdown: HTMLElement) => {
    if (isOpen(dropdown)) {
      close(dropdown);
    } else {
      open(dropdown);
    }
  };

  return {
    close,
    open,
    isOpen,
    toggle,
  };
}
