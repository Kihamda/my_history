const FullWidthCardHeader = ({
  title,
  memo,
  buttons,
}: {
  title: string;
  memo?: string;
  buttons?: React.ReactNode;
}): React.ReactElement => {
  return (
    <div className="card">
      <div className="card-body d-flex flex-wrap">
        <div className="flex-grow-1">
          <h3 className="card-title">{title}</h3>
          <p className="card-text">{memo}</p>
        </div>
        <div className="flex-shrink-0 text-end">{buttons}</div>
      </div>
    </div>
  );
};

export default FullWidthCardHeader;
