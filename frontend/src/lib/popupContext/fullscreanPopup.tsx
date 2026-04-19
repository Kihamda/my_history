/* eslint-disable react-refresh/only-export-components */

import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface PopupData {
  content: ReactNode;
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
        <FullscreenPopupCard close={hidePopup}>
          {popupState.data.content}
        </FullscreenPopupCard>
      )}
    </PopupContext.Provider>
  );
};

const FullscreenPopupCard = ({
  children,
  close,
}: {
  children: React.ReactNode;
  close: () => void;
}): React.ReactElement => {
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      close();
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
          <div style={{ overflowX: "scroll", ...cardStyle }}>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default PopupProvider;
