import React from "react";

const World = (props: any): JSX.Element => {
  return (
    <svg
      width={props.width || 18}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 18 18"
    >
      <path
        fill={props.fill || "#fff"}
        d="M16.14 4.3l-.3.1-1.3.1-.4.6-.3-.1-1.1-1-.1-.5-.2-.5-.7-.6-.8-.2v.4l.8.8.4.5-.4.2-.4-.1-.5-.2v-.4L10 3l-.2 1-.7.1.1.6.9.2.2-.9.7.1.3.2h.6l.4.8 1 1-.1.4-.8-.1-1.4.7-1 1.2-.2.6h-.3l-.7-.4-.7.4.2.6.3-.3h.5v.6l.4.2.4.5.7-.2.8.1.9.2.5.1.7.8 1.5.9-1 1.8-1 .5-.4 1-1.5 1-.2.6A8.5 8.5 0 0017.44 9a7.6 7.6 0 00-1.3-4.7zM10 13.4l-.6-1.1.6-1.2-.6-.2-.7-.6-1.36-.3-.5-1v.6h-.2l-1.2-1.7V6.6l-.9-1.5-1.4.3h-1l-.4-.3.6-.5-.6.1A8 8 0 00.54 9 8.49 8.49 0 009 17.5a4.1 4.1 0 001.1-.1l-.1-1s.4-1.5.4-1.6l-.4-1.4zM3.74 3.2l1.5-.2.7-.4.8.2L8 2.7l.4-.7.6.1h1.5l.4-.5.6-.4.8.1h.3A8.55 8.55 0 002.44 3.6l1.3-.4zm5.7-1.9l.9-.5.6.3-.9.7-.8.1-.3-.2.5-.4zm-2.6.1l.4.2.5-.2.3.5-1.2.3-.6-.3s.6-.4.6-.5z"
      />
    </svg>
  );
};

export default World;
