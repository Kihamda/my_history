import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { createContext, useContext, useState, ReactNode } from "react";

interface PopupData {
  content: ReactNode;
  title?: ReactNode;
  footer?: ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface PopupContextType {
  showPopup: (data: PopupData) => void;
  hidePopup: () => void;
  isVisible: boolean;
}

const PopupContext = createContext<PopupContextType | undefined>(undefined);

export const usePopup = () => {
  const context = useContext(PopupContext);
  if (!context) {
    throw new Error("usePopup must be used within a PopupProvider");
  }
  return context;
};

interface PopupProviderProps {
  children: ReactNode;
}

export const PopupProvider: React.FC<PopupProviderProps> = ({ children }) => {
  const [popupState, setPopupState] = useState<{
    isVisible: boolean;
    data?: PopupData;
  }>({
    isVisible: false,
  });

  const showPopup = (data: PopupData) => {
    setPopupState({
      isVisible: true,
      data,
    });
  };

  const hidePopup = () => {
    if (popupState.data?.onClose) {
      popupState.data.onClose();
    }
    setPopupState({
      isVisible: false,
    });
  };

  return (
    <PopupContext.Provider
      value={{
        showPopup,
        hidePopup,
        isVisible: popupState.isVisible,
      }}
    >
      {children}
      {popupState.isVisible && popupState.data && (
        <FullscreenPopupCard
          onClose={hidePopup}
          showCloseButton={popupState.data.showCloseButton}
          title={popupState.data.title}
          footer={popupState.data.footer}
        >
          {popupState.data.content}
        </FullscreenPopupCard>
      )}
    </PopupContext.Provider>
  );
};

const FullscreenPopupCard = ({
  children,
  onClose,
  title,
  footer,
  showCloseButton = true,
}: {
  children: React.ReactNode;
  onClose?: () => void;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}): React.ReactElement => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) {
      onClose();
    }
  };

  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    backdropFilter: "blur(5px)",
  };

  const cardStyle: React.CSSProperties = {
    maxWidth: "90vw",
    maxHeight: "90vh",
    position: "relative",
  };

  return (
    <div style={overlayStyle} onClick={handleBackdropClick}>
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-8 col-lg-6 col-xxl-4">
          <div style={cardStyle} className="card">
            {showCloseButton && onClose && (
              <div className="card-header d-flex">
                <h5 className="flex-grow-1 d-flex align-items-center mb-0">
                  {title}
                </h5>
                <div className="flex-grow-0">
                  <button
                    className="btn btn-light"
                    onClick={onClose}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        "rgba(255, 255, 255, 0.2)";
                    }}
                  >
                    <FontAwesomeIcon icon={faClose} />
                  </button>
                </div>
              </div>
            )}
            <div className="card-body" style={{ overflow: "auto" }}>
              {children}
            </div>
            {footer && <div className="card-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupProvider;
