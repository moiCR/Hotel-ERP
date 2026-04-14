import { useState } from '#imports';

export interface ToastConfig {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export const useToast = () => {
    const toasts = useState<ToastConfig[]>('global-toasts', () => []);
    let nextId = 0;

    const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
        const id = nextId++;
        toasts.value.push({ id, message, type });
        
        // Auto remove after 4.5 seconds
        setTimeout(() => {
            toasts.value = toasts.value.filter(t => t.id !== id);
        }, 4500);
    }

    const removeToast = (id: number) => {
        toasts.value = toasts.value.filter(t => t.id !== id);
    }

    return {
        toasts,
        showToast,
        removeToast
    }
}
