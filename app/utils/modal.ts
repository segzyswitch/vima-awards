// utils/modal.ts
export const closeModal = (id: string) => {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  // Lazy import bootstrap only on client
  const bootstrap = (window as any).bootstrap;
  const modal = bootstrap.Modal.getInstance(modalEl) 
              || new bootstrap.Modal(modalEl);

  modal.hide();
};

export const openModal = (id: string) => {
  const modalEl = document.getElementById(id);
  if (!modalEl) return;

  // Lazy import bootstrap only on client
  const bootstrap = (window as any).bootstrap;
  const modal = bootstrap.Modal.getInstance(modalEl) 
              || new bootstrap.Modal(modalEl);

  modal.show();
};