import { keyframes, styled } from "styled-components";

const rotate = keyframes`
  from { 
    transform: rotate(0deg); 
  }

  to { 
    transform: rotate(360deg); 
  }
`;

const RotateClockwise = styled.div`
  animation: ${rotate} 2s linear infinite
`;

const RotateCounterClockwise = styled.div`
  animation: ${rotate} 2s linear reverse infinite
`;

interface HeaderProps {
  spin: boolean;
}

export default function Header({ spin }: HeaderProps) {
  return (
    <h1 className={`m-4 d-flex justify-content-center gap-3`}>
      {spin ? (
        <RotateClockwise>💀</RotateClockwise>
      ) : (
        <div>💀</div>
      )}
      Death Roll
      {spin ? (
        <RotateCounterClockwise>💀</RotateCounterClockwise>
      ) : (
        <div>💀</div>
      )}
    </h1>
  );
}