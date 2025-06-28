import axios, { AxiosInstance, AxiosError } from 'axios';
import { HttpException, HttpStatus } from '@nestjs/common';
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();


export function setupAxiosInterceptors(): AxiosInstance {
  const axiosInstance = axios.create();

  axiosInstance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response;

        if (status === 404) {
          throw new HttpException((data as any)?.message || 'Resource not found', HttpStatus.NOT_FOUND);
        } else if (status === 400) {
          throw new HttpException((data as any)?.message || 'Bad request', HttpStatus.BAD_REQUEST);
        } else {
          throw new HttpException((data as any)?.message || 'Failed to process payment transaction', status);
        }
      } else {
        throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  );

  return axiosInstance;
}



