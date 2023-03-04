export {}

declare global {
	namespace Express {
		export interface Response {
			data(data: any): Response
			error(err: string): Response
		}
	}
}
