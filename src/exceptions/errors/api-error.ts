import { HttpException } from "@nestjs/common"

export default class ApiError extends HttpException {
	error_code: number
	errors: any[]

	constructor(status: number, message: string, errors = []) {
		super(message, status)
		this.error_code = status
		this.errors = errors
	}

	static UnauthorizedError() {
		return new ApiError(401, 'Вы не авторизованы')
	}

	static BadRequest(message: string, errors = []) {
		return new ApiError(400, message, errors)
	}
}