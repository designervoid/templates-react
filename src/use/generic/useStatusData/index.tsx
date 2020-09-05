import React from 'react';

import requestData from 'util/dataFormat/requestData';
import { StatusFormat, ErrorCodeFormat } from 'util/dataFormat/globalStateFormat';

interface GetDataProperties<T> {
  /**
   * Function to request data from the server
   */
  getAll: () => Promise<T>;
  /**
   * Before send the request
   */
  onBefore?: () => void;
  /**
   * Run it when the request is successfull
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess?: (response: T) => void;
  /**
   * Run it when the request fail
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onFail?: (errors: ErrorCodeFormat) => void;
  /**
   * Run it when the request is done.
   */
  onDone?: () => void;
}

/**
 * Return the function to request data and the request's status
 */
function useStatusData<T>() {
  const [status, setStatus] = React.useState<StatusFormat>({
    submit: false,
    loaded: false,
  });

  const mounted = React.useRef(true);
  // eslint-disable-next-line arrow-body-style
  React.useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const getData = React.useCallback(({
    getAll,
    onBefore,
    onSuccess,
    onFail,
    onDone,
  }: GetDataProperties<T>) => {
    requestData(
      () => {
        if (mounted.current) {
          if (onBefore) {
            onBefore();
          }
          setStatus((currentStatus) => ({ ...currentStatus, submit: true }));
        }
        return getAll();
      },
      (response: T) => {
        if (mounted.current && onSuccess) {
          onSuccess(response);
        }
      },
      (errors: ErrorCodeFormat) => {
        if (mounted.current) {
          setStatus((currentStatus) => ({ ...currentStatus, ...errors }));
          if (onFail) {
            onFail(errors);
          }
        }
      },
      () => {
        if (mounted.current) {
          setStatus((currentStatus) => ({ ...currentStatus, submit: false, loaded: true }));
          if (onDone) {
            onDone();
          }
        }
      },
    );
  }, []);

  return {
    status,
    getData,
  };
}

export default useStatusData;