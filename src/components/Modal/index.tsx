import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export interface IPropsModal {
  open: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  title?: string;
  description?: string;
  messageError?: string;
  toggle?(): void;
  onSubmit?(): Promise<void> | void;
  children?: React.ReactNode;
}

export const ModalComponent: React.FC<IPropsModal> = ({
  title = "Modal",
  open,
  setOpen,
  onSubmit,
  children,
  toggle,
}) => {
  const handleClose = () => {
    if (!toggle && setOpen) {
      return setOpen((prev) => !prev);
    } else if (toggle) {
      return toggle();
    }
  };

  return (
    <>
      {open ? (
        <div className="fixed flex flex-col justify-self-center self-center h-full w-full z-50 bg-zinc-950/50">
          <div
            aria-hidden="true"
            className={`${
              !open && "hidden"
            } overflow-x-hidden flex justify-center items-center w-full h-full`}
          >
            <div className="p-4 w-full max-w-3xl max-h-full">
              <div className="relative rounded shadow bg-zinc-800">
                <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h3>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="text-gray-400 bg-transparent hover:bg-gray-400 hover:text-gray-900 rounded-lg text-sm h-8 w-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-700 dark:hover:text-white"
                    data-modal-toggle="timeline-modal"
                  >
                    <X />
                  </button>
                </div>
                <div className="p-4 md:p-7 md:max-h-96 md:overflow-y-auto">
                  {children}
                </div>
                <div className="border-t dark:border-gray-600 p-4 flex flex-col justify-center items-end">
                  <button
                    type="button"
                    onClick={onSubmit ?? handleClose}
                    className="rounded px-5 py-2 text-gray-400 hover:bg-gray-400 dark:hover:bg-gray-700 dark:hover:text-white hover:text-gray-900 bg-blue-600 border dark:border-blue-600"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
