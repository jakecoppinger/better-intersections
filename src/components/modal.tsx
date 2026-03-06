import { FunctionComponent, Fragment} from 'react';
import ReactDOM from 'react-dom/index';
import {
  Wrapper,
  Header,
  StyledModal,
  HeaderText,
  CloseButton,
  Content,
  Backdrop,
} from '../styles/modal.style';
export interface ModalProps {
  isShown: boolean;
  hide: () => void;
  modalContent: React.ReactNode;
  headerText: string;
}
export const Modal: FunctionComponent<ModalProps> = ({
  isShown,
  hide,
  modalContent,
  headerText,
}) => {
  const modal = (
    <Fragment>
      <Backdrop />
      <Wrapper>
        <StyledModal>
          <Header>
            <HeaderText>{headerText}</HeaderText>
            <CloseButton onClick={hide}>X</CloseButton>
          </Header>
          <Content>{modalContent}</Content>
        </StyledModal>
      </Wrapper>
    </Fragment>
  );
  return isShown ? ReactDOM.createPortal(modal, document.body) : null;
};