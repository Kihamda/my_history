import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { usePopup } from "./fullscreanPopup";
import { faClose } from "@fortawesome/free-solid-svg-icons";

export const PopupCard = ({
  children,
  title,
  footer,
  showCloseButton = true,
}: {
  children: React.ReactNode;
  title?: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
}): React.ReactElement => {
  const { hidePopup } = usePopup();

  return (
    <div className="card">
      {showCloseButton && (
        <div className="card-header d-flex">
          <h5 className="flex-grow-1 d-flex align-items-center mb-0">
            {title}
          </h5>
          <div className="flex-grow-0">
            <button
              className="btn btn-light"
              onClick={hidePopup}
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
  );
};
