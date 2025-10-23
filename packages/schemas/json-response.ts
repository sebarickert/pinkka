type SuccessResponse<T> = {
	status: 'success';
	data: T;
};

type FailResponse = {
	status: 'fail';
	data: Record<string, unknown>;
};

type ErrorResponse = {
	status: 'error';
	message: string;
	code?: string | number;
	data?: unknown;
};

export type JsonResponse<T = unknown> =
	| SuccessResponse<T>
	| FailResponse
	| ErrorResponse;
