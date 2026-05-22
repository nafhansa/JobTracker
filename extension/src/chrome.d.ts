declare namespace chrome {
  namespace runtime {
    function sendMessage(
      message: unknown,
      callback?: (response: unknown) => void
    ): void;
    const onMessage: {
      addListener(
        callback: (
          message: unknown,
          sender: { tab?: { id?: number; url?: string } },
          sendResponse: (response?: unknown) => void
        ) => boolean | void
      ): void;
    };
  }
}
