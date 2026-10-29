"use client"

import * as React from "react"
import { useForm } from "@tanstack/react-form"
import Cropper from "react-easy-crop"
import type { Point, Area } from "react-easy-crop"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"

import { updateAvatar } from "../actions/update-avatar"

export function UpdateAvatarButton({ userId }: { userId: string }) {
  const [open, setOpen] = React.useState(false)
  const [imageSrc, setImageSrc] = React.useState<string | null>(null)
  const [crop, setCrop] = React.useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = React.useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = React.useState<Area | null>(
    null,
  )
  const [cropSize, setCropSize] = React.useState<{
    width: number
    height: number
  } | null>(null)
  const [estimatedSize, setEstimatedSize] = React.useState<number | null>(null)
  const [isUploading, setIsUploading] = React.useState(false)

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels)

    setCropSize({
      width: Math.round(croppedAreaPixels.width),
      height: Math.round(croppedAreaPixels.height),
    })

    const pixelCount = croppedAreaPixels.width * croppedAreaPixels.height
    // 0.3 为经验系数
    const estimatedKB = Math.round((pixelCount * 0.3) / 1024)

    setEstimatedSize(estimatedKB)
  }

  const getCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<File> => {
    const image = new Image()
    image.src = imageSrc

    await new Promise((resolve) => (image.onload = resolve))

    const offscreenCanvas = new OffscreenCanvas(
      pixelCrop.width,
      pixelCrop.height,
    )
    const ctx = offscreenCanvas.getContext("2d")
    if (!ctx) {
      throw new Error("无法获取 offscreen canvas 2D 上下文")
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height,
    )

    const blob = await offscreenCanvas.convertToBlob({
      type: "image/jpeg",
      quality: 0.9,
    })

    return new File([blob], "avatar.jpg", { type: "image/jpeg" })
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const reader = new FileReader()
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null)
      })
      reader.readAsDataURL(event.target.files[0])
    }
  }

  const handleFormAction = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setIsUploading(true)

    try {
      const croppedFile = await getCroppedImage(imageSrc, croppedAreaPixels)

      const formData = new FormData()
      formData.append("avatar", croppedFile)

      await updateAvatar(userId, formData)

      setOpen(false)
      setImageSrc(null)
    } catch (error) {
      console.error(error)
      alert("上传失败")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">更换头像</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>更换头像</DialogTitle>
          <DialogDescription>在此处更换头像，点击保存更新</DialogDescription>
        </DialogHeader>
        <form action={handleFormAction}>
          <FieldGroup>
            <Field>
              <Label
                htmlFor="avatar"
                className="hover:bg-muted cursor-pointer justify-center rounded border py-2.5"
              >
                选择文件
                <Input
                  className="hidden"
                  id="avatar"
                  name="avatar"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </Label>
            </Field>

            {imageSrc && (
              <>
                <div className="relative h-96 w-full">
                  <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1} // 1:1 正方形，头像常用
                    cropShape="round" // 圆形裁剪框
                    showGrid={false}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={handleCropComplete}
                  />
                </div>
                {cropSize && (
                  <div className="text-muted-foreground space-y-1 text-center text-sm">
                    <div>
                      当前裁剪尺寸：{cropSize.width} × {cropSize.height} 像素
                    </div>
                    <div>
                      预估上传大小：
                      <span className="text-foreground font-semibold">
                        {" "}
                        ≈ {estimatedSize} KB
                      </span>
                    </div>
                    <div
                      className={
                        estimatedSize && estimatedSize < 50
                          ? "text-orange-500"
                          : "text-green-500"
                      }
                    >
                      {estimatedSize && estimatedSize < 50
                        ? "建议放大以获得更清晰头像（≥50KB 推荐）"
                        : estimatedSize && estimatedSize > 300
                          ? "文件稍大，可适当缩小"
                          : "大小合适，推荐！"}
                    </div>
                  </div>
                )}
                <Field>
                  <Label>缩放</Label>
                  <Slider
                    min={1}
                    max={3}
                    step={0.1}
                    value={[zoom]}
                    onValueChange={(v) => setZoom(v[0])}
                  />
                </Field>
              </>
            )}

            <Field className="justify-end" orientation="horizontal">
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <Button type="submit">更新</Button>
            </Field>
          </FieldGroup>
        </form>
      </DialogContent>
    </Dialog>
  )
}
