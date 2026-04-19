/* eslint-disable react-refresh/only-export-components */

import { useState, useEffect } from "react";
import type { ReactNode, FC } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleCheck,
  faCircleInfo,
  faCircleXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";

type AlertLevel = "error" | "warning" | "info" | "success";
type RaisedError = {
  id: string;
  message: string;
  sub?: string;
  trace?: string;
  level: AlertLevel;
};

// アプリ内で共有するイベントを発行するためのオブジェクト
const errorEventEmitter = new EventTarget();
const ERROR_EVENT_NAME = "raise-error";

const levelToVariant: Record<AlertLevel, string> = {
  error: "danger",
  warning: "warning",
  info: "info",
  success: "success",
};

const levelToIcon: Record<AlertLevel, typeof faCircleCheck> = {
  error: faCircleXmark,
  warning: faTriangleExclamation,
  info: faCircleInfo,
  success: faCircleCheck,
};

const createId = () =>
  crypto.randomUUID?.() ??
  `${Date.now()}-${Math.random().toString(16).slice(2)}`;

/**
 * エラーを発生させるための関数。
 * @param message エラーメッセージ
 * @param level エラーレベル
 */
export const raiseError = (
  message: string,
  level: AlertLevel = "error",
  sub?: string,
  trace?: string,
) => {
  const detail: RaisedError = {
    id: createId(),
    message: message,
    trace: import.meta.env.DEV ? trace : undefined,
    level,
    sub,
  };

  // カスタムイベントを発行してエラーメッセージを伝える
  errorEventEmitter.dispatchEvent(
    new CustomEvent<RaisedError>(ERROR_EVENT_NAME, { detail }),
  );
};

/**
 * エラーアラートを表示するためのUIコンポーネント。
 * アプリケーションのルートで子要素をラップして使用する。
 */
const ErrorProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [error, setError] = useState<RaisedError[]>([]);

  useEffect(() => {
    // raise-errorイベントをリッスンするハンドラ
    const handleError = (event: Event) => {
      if (event instanceof CustomEvent) {
        const detail = event.detail as RaisedError;
        setError((prev) => [...prev, detail]);
        // 5秒後にアラートを消す
        setTimeout(() => {
          setError((prev) => prev.filter((msg) => msg.id !== detail.id));
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
        {error.map(({ id, message, sub, trace, level }) => (
          <div
            key={id}
            className={`alert alert-${levelToVariant[level]} alert-dismissible fade show m-0 mt-2 d-flex align-items-center gap-2`}
            role="alert"
            style={{ minWidth: "250px" }}
          >
            <FontAwesomeIcon icon={levelToIcon[level]} />
            <div className="d-flex flex-column gap-1">
              <span>{message}</span>
              {sub && <span className="small text-muted">{sub}</span>}
              {trace ? (
                <pre
                  className="mb-0 small bg-transparent border-0 p-0 text-body-secondary"
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {trace}
                </pre>
              ) : null}
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setError((prev) => prev.filter((msg) => msg.id !== id))
              }
              aria-label="Close"
            ></button>
          </div>
        ))}
      </div>
    </>
  );
};

export default ErrorProvider;
