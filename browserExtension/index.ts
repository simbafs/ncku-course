type Info = {
	name: string
	department: string
	grade: number
	id: string
	semester: number
	year: number
}

type Course = {
	number: string
	classCode: string
}

function getInfo(): Info {
	const text = $('#form1 > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)')
		.text()
		.trim()
		.split(' ')
	return {
		name: text[4],
		department: text[1],
		grade: parseInt(text[2]),
		id: text[3],
		semester: text[0].slice(-1) === '上' ? 1 : 2,
		year: parseInt(text[0].slice(0, -1)),
	}
}

function isInSemesterPage() {
	const text = $('table:nth-child(3) tr:nth-child(1) ')?.text() || ''
	return !isNaN(parseInt(text.trim()[0]))
}

$('#form1 > table:nth-child(3) > tbody:nth-child(1) > tr')
	.slice(2, -2)
	.filter((index, element) => {
		return $(':nth-child(10)', element).text() === '檢視'
	})
	.find('td:nth-child(3)')

async function getHistogram(info: Info, course: Course) {
	return fetch(
		`https://qrys.ncku.edu.tw/ncku/histogram.asp?syear=${info.year}&sem=${info.semester}&co_no=${course.number}&class_code=${course.classCode}`
	)
		.then(async res => {
			if (!res.ok) throw new Error('404 not found')
			return {
				course: `${info.year}.${info.semester}-${course.number}${course.classCode}`,
				blob: await res.blob(),
			}
		})
		.catch(console.error)
}

async function uploadFiles(data: { course: string; blob: Blob }[]) {
	let form = new FormData()
	data.forEach(item => form.append(item.course, item.blob))
	form.append('files', JSON.stringify(data.map(item => item.course)))
	form.append('info', JSON.stringify(getInfo()))
	return fetch('http://localhost:3000/upload', {
		method: 'post',
		body: form,
	})
}

function getCourse(): Course[] {
	return Array.from(
		$('#form1 > table:nth-child(3) > tbody:nth-child(1) > tr')
			.slice(2, -2)
			.filter((_, element) => {
				return $(':nth-child(10)', element).text() === '檢視'
			})
			.find('td:nth-child(3)')
			.map((_, element) => $(element).text())
	).map(item => ({
		number: item.slice(0, 7),
		classCode: item.slice(7, 8),
	}))
}

const upload = async () => Promise.all(getCourse().map(item => getHistogram(getInfo(), item))).then(uploadFiles).then(async res => res.json())
