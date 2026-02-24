interface Window {
  snap?: {
    pay: (token: string, options: {
      onSuccess?: (result: any) => void;
      onPending?: (result: any) => void;
      onFailed?: (result: any) => void;
      onClose?: () => void;
    }) => void;
  };
}
