// ==UserScript==
// @name         NCKU score histogram uploader
// @namespace    https://simbafs.cc/
// @version      0.1
// @description  NCKU score histogram uploader
// @author       SimbaFs
// @match        https://qrys.ncku.edu.tw/ncku/qrys05.asp
// @icon         https://www.ncku.edu.tw/var/file/0/1000/msys_1000_556236_23708.ico
// @grant        none
// ==/UserScript==
;(() => {
	'use strict'
	const uploadURL = 'http://localhost:3000/upload'

	function getInfo() {
		const text = $('#form1 > table:nth-child(3) > tbody:nth-child(1) > tr:nth-child(1) > td:nth-child(1)')
			.text()
			.trim()
			.split(' ')
		let year = parseInt(text[0].slice(0, -1))
		let semester = text[0].slice(-1) === '上' ? 1 : 2
		return {
			name: text[4],
			department: text[1],
			grade: parseInt(text[2]),
			schoolID: text[3],
			semester: year * 10 + semester,
		}
	}

	function isInSemesterPage() {
		const text = $('table:nth-child(3) tr:nth-child(1) ')?.text() || ''
		return !isNaN(parseInt(text.trim()[0]))
	}

	async function getHistogram(info, course) {
		return fetch(
			`https://qrys.ncku.edu.tw/ncku/histogram.asp?syear=${Math.floor(info.semester / 10)}&sem=${
				info.semester % 10
			}&co_no=${course.number}&class_code=${course.classCode}`
		)
			.then(async res => {
				if (!res.ok) throw new Error('404 not found')
				return {
					course: `${course.number}-${course.classCode}`,
					blob: await res.blob(),
				}
			})
			.catch(console.error)
	}

	async function uploadFiles(data) {
		let form = new FormData()
		data.forEach(item => form.append(item.course, item.blob))
		form.append('files', JSON.stringify(data.map(item => item.course)))
		form.append('info', JSON.stringify(getInfo()))
		return fetch(uploadURL, {
			method: 'post',
			body: form,
		})
	}

	function getCourse() {
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
			classCode: item.slice(7),
		}))
	}

	// call this function to automatically collect data and upload to server
	const upload = async () =>
		Promise.all(getCourse().map(item => getHistogram(getInfo(), item)))
			.then(files => {
				console.log(files)
				return files
			})
			.then(uploadFiles)
			.then(async res => res.json())

	window.upload = upload
	window.getCourse = getCourse
	window.getHistogram = getHistogram
	window.uploadFiles = uploadFiles
	window.getInfo = getInfo
})()

console.log('NCKU score histogram uploader loaded')
