import { User, Course, Image } from './init'

type Contrib = {
	info: {
		id: string
		name: string
		grade: number
	}
	histogram: {
		blob: Blob
		year: number
		semester: number
		courseNumber: string
		classCode: string
		md5: string
	}[]
}

export function saveContrib(contrib: Contrib){
	

}
