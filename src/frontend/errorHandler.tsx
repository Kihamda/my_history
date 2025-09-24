import { useState, useEffect, ReactNode, FC } from "react";

// アプリ内で共有するイベントを発行するためのオブジェクト
const errorEventEmitter = new EventTarget();
const ERROR_EVENT_NAME = "raise-error";

/**
 * エラーを発生させるための関数。
 * @param devMessage 開発環境で表示する詳細なエラーメッセージ
 * @param userMessage (オプション) 本番環境でユーザーに表示するメッセージ
 */
export const raiseError = (devMessage: string, userMessage?: string) => {
  // 環境に応じて表示するメッセージを決定
  const message = import.meta.env.DEV
    ? devMessage
    : userMessage ||
      "エラーが発生しました。しばらくしてからもう一度お試しください。";

  // カスタムイベントを発行してエラーメッセージを伝える
  errorEventEmitter.dispatchEvent(
    new CustomEvent(ERROR_EVENT_NAME, { detail: message })
  );
};

/**
 * エラーアラートを表示するためのUIコンポーネント。
 * アプリケーションのルートで子要素をラップして使用する。
 */
export const ErrorProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<string[]>([]);

  useEffect(() => {
    // raise-errorイベントをリッスンするハンドラ
    const handleError = (event: Event) => {
      if (event instanceof CustomEvent) {
        const message = event.detail;
        setError((prev) => [...prev, message]);
        // 5秒後にアラートを消す
        setTimeout(() => {
          setError((prev) => prev.filter((msg) => msg !== message));
        }, 5000);
      }
    };

    // イベントリスナーを登録
    errorEventEmitter.addEventListener(ERROR_EVENT_NAME, handleError);

    // コンポーネントのアンマウント時にリスナーを解除
    return () => {
      errorEventEmitter.removeEventListener(ERROR_EVENT_NAME, handleError);
    };
  }, []); // このeffectはマウント時に一度だけ実行

  return (
    <>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "1rem",
          right: "1rem",
          zIndex: 9999,
        }}
      >
        {error.map((message, index) => (
          <div
            key={index} // 同じメッセージが複数回来た時のためにindexをキーにする
            className="alert alert-danger alert-dismissible fade show m-0 mt-2"
            role="alert"
            style={{ minWidth: "250px" }}
          >
            {message}
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setError((prev) => prev.filter((_, i) => i !== index))
              }
              aria-label="Close"
            ></button>
          </div>
        ))}
      </div>
    </>
  );
};
