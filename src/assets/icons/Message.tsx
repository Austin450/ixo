import React from "react";

const Message = (props: any): JSX.Element => {
  return (
    <svg
      width={props.width || 17}
      viewBox="0 0 17 14"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill={props.fill || "#fff"}
        d="M14.9759 0.327148H2.13969C1.25719 0.327148 0.543179 1.04919 0.543179 1.93168L0.535156 11.5589C0.535156 12.4413 1.25719 13.1634 2.13969 13.1634H14.9759C15.8584 13.1634 16.5805 12.4413 16.5805 11.5589V1.93168C16.5805 1.04919 15.8584 0.327148 14.9759 0.327148ZM14.9759 3.53621L8.5578 7.54753L2.13969 3.53621V1.93168L8.5578 5.943L14.9759 1.93168V3.53621Z"
      />
    </svg>
  );
};

export default Message;
