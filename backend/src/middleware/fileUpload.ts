import fs from "fs";
import path from "path";
import multer, { type FileFilterCallback, type StorageEngine } from "multer";
import type { Request } from "express";

export const baseUploadPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(baseUploadPath)) {
	fs.mkdirSync(baseUploadPath, { recursive: true });
}

type UploadFolder = "profile-images" | "doctor-files";

const getStorage = (folder: UploadFolder): StorageEngine => {
	const uploadPath = path.join(baseUploadPath, folder);

	if (!fs.existsSync(uploadPath)) {
		fs.mkdirSync(uploadPath, { recursive: true });
	}

	return multer.diskStorage({
		destination: (_req: Request, _file: Express.Multer.File, cb) => {
			cb(null, uploadPath);
		},
		filename: (_req: Request, file: Express.Multer.File, cb) => {
			const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
			const ext = path.extname(file.originalname);
			cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
		}
	});
};

const resumeFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
	const allowed = [
		"application/pdf",
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	];

	if (allowed.includes(file.mimetype)) {
		cb(null, true);
		return;
	}

	cb(new Error("Invalid resume file type"));
};

const imageFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
	const allowed = ["image/jpeg", "image/png", "image/webp"];

	if (allowed.includes(file.mimetype)) {
		cb(null, true);
		return;
	}

	cb(new Error("Invalid image type"));
};


export const uploadUserProfile = multer({
	storage: getStorage("profile-images"),
	limits: { fileSize: 5 * 1024 * 1024 },
	fileFilter: imageFilter
});

export const uploadProfileImage = uploadUserProfile;

export const uploadDoctorFile = multer({
	storage: getStorage("doctor-files"),
	limits: { fileSize: 10 * 1024 * 1024 },
	fileFilter: resumeFilter
});
