import { BadRequestException, Injectable } from '@nestjs/common'
import { path } from 'app-root-path'
import { ensureDir, writeFile, remove } from 'fs-extra'
import { FileResponse } from './types/file.types'

@Injectable()
export class FileService {
	async saveFile(
		file: Express.Multer.File,
		folder: string
	): Promise<FileResponse> {
		if (!folder) throw new BadRequestException('folder is required')
		const uploadFolder = `${path}/uploads/${folder}`
		await ensureDir(uploadFolder)

		await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer)

		return {
			url: `/uploads/${folder}/${file.originalname}`,
			name: file.originalname,
		}
	}

	async deleteFile(filePath: string) {
		await remove(`${path}${filePath}`)
	}
}
