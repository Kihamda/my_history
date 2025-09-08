import React, { createContext, useContext, useState, ReactNode } from "react";

interface PopupData {
  content: ReactNode;
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
  showCloseButton = true,
}: {
  children: React.ReactNode;
  onClose?: () => void;
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
    overflow: "auto",
    position: "relative",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "10px",
    right: "15px",
    background: "rgba(255, 255, 255, 0.2)",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
  };

  return (
    <div style={overlayStyle} onClick={handleBackdropClick}>
      <div style={cardStyle} className="card">
        <div className="card-body">
          {showCloseButton && onClose && (
            <button
              style={closeButtonStyle}
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
              ×
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};

export default PopupProvider;
