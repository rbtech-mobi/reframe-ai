/**
 * Custom hook that encapsulates the state machine for the reframe
 * operation. Exposes handlers for input, submission and reset.
 */

import { useState, useCallback } from 'react';
import { reframeMessage } from '../services/generator';
import type { ReframeResult, ReframeState, ReframeStatus } from '../types';

export interface UseReframeReturn {
  status: ReframeStatus;
  message: string;
  loading: boolean;
  result: ReframeResult | null;
  error: string | null;
  setMessage: (text: string) => void;
  submit: () => Promise<void>;
  reset: () => void;
  clearMessage: () => void;
}

/**
 * Custom hook that encapsulates the state machine for the reframe operation.
 * Manages idle, loading, success and error states, with input validation and reset capability.
 */
export function useReframe(): UseReframeReturn {
  const [state, setState] = useState<ReframeState>({
    status: 'idle',
    message: '',
    loading: false,
    result: null,
    error: null,
  });

  /**
   * Updates message state and resets transient error.
   */
  const setMessage = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      message: text,
      error: prev.error ? null : prev.error,
    }));
  }, []);

  /**
   * Clears the current input text.
   */
  const clearMessage = useCallback(() => {
    setState((prev) => ({
      ...prev,
      message: '',
      error: null,
    }));
  }, []);

  /**
   * Submits the message for IA reinterpretation.
   * Enforces input validation (blocks empty or whitespace-only messages).
   */
  const submit = useCallback(async () => {
    const trimmed = state.message.trim();

    // 1. Validação de entrada: bloqueia mensagens vazias ou apenas com espaços
    if (!trimmed) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: 'Por favor, digite ou cole uma mensagem antes de analisar.',
      }));
      return;
    }

    // 2. Transição para o estado de loading
    setState((prev) => ({
      ...prev,
      status: 'loading',
      loading: true,
      error: null,
    }));

    try {
      // 3. Chamada ao serviço de IA
      const result = await reframeMessage(trimmed);

      // 4. Sucesso: armazena resultado e atualiza status
      setState((prev) => ({
        ...prev,
        status: 'success',
        loading: false,
        result,
        error: null,
      }));
    } catch (err) {
      // 5. Tratamento de falhas amigável
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Não foi possível analisar a mensagem. Verifique a conexão e tente novamente.';

      setState((prev) => ({
        ...prev,
        status: 'error',
        loading: false,
        result: null,
        error: errorMessage,
      }));
    }
  }, [state.message]);

  /**
   * Fornece opção de reset ("Nova Análise") para retornar ao estado inicial sem recarregar o app.
   */
  const reset = useCallback(() => {
    setState({
      status: 'idle',
      message: '',
      loading: false,
      result: null,
      error: null,
    });
  }, []);

  return {
    status: state.status,
    message: state.message,
    loading: state.loading,
    result: state.result,
    error: state.error,
    setMessage,
    submit,
    reset,
    clearMessage,
  };
}
