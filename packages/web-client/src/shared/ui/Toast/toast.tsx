import {
  toast as baseToast,
  ToastContainer as BaseToastContainer,
  type ToastContainerProps,
  type ToastOptions,
} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./ToastContainer.module.css";

const defaultOptions: ToastOptions = {
  autoClose: 4000,
  hideProgressBar: true,
};

export const toast = {
  success: (message: string, options?: ToastOptions) =>
    baseToast.success(message, { ...defaultOptions, ...options }),
  error: (message: string, options?: ToastOptions) =>
    baseToast.error(message, { ...defaultOptions, ...options }),
};

export const ToastContainer = (props: ToastContainerProps) => {
  return (
    <BaseToastContainer
      className={styles.container}
      limit={3}
      position="top-center"
      {...props}
    />
  );
};
