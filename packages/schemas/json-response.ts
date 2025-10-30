export type SuccessResponse<T> = {
	status: 'success';
	data: T;
};

export type FailResponse = {
	status: 'fail';
	data: Record<string, unknown>;
};

export type ErrorResponse = {
	status: 'error';
	message: string;
	code?: string | number;
	data?: unknown;
};

export type JsonResponse<T = unknown> =
	| SuccessResponse<T>
	| FailResponse
	| ErrorResponse;
