import { useEffect, useMemo, useState } from "react";
import { addProduct } from "../data/productStore";

const CATEGORY_OPTIONS = [
  "Coding",
  "Battery Backup",
  "Macbook",
  "Gaming",
  "Student",
  "Thin & Light",
  "Professional",
];

const initialForm = {
  name: "",
  description: "",
  price: "",
  discountPercentage: "",
  quantity: "",
  position: "50",
  category: "",
  imageUrlsText: "",
};

const fieldClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100";

const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.7;
const MAX_BASE64_LENGTH = 900000;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const ratio = Math.min(
          1,
          MAX_IMAGE_DIMENSION / Math.max(image.width, image.height)
        );
        const width = Math.max(1, Math.round(image.width * ratio));
        const height = Math.max(1, Math.round(image.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");

        if (!context) {
          reject(new Error("Could not process image."));
          return;
        }

        context.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);

        if (dataUrl.length > MAX_BASE64_LENGTH) {
          reject(
            new Error(
              "Image is too large after compression. Choose a smaller image."
            )
          );
          return;
        }

        resolve(dataUrl);
      };
      image.onerror = () => reject(new Error("Failed to process image"));
      image.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.readAsDataURL(file);
  });

const AddProduct = () => {
  const [form, setForm] = useState(initialForm);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const basePrice = Number(form.price) || 0;
  const discountPercent = Math.min(100, Math.max(0, Number(form.discountPercentage) || 0));
  const finalPrice = Math.max(0, basePrice - (basePrice * discountPercent) / 100);

  const previewUrls = useMemo(
    () =>
      selectedFiles.map((file) => ({
        key: `${file.name}-${file.lastModified}`,
        url: URL.createObjectURL(file),
        name: file.name,
      })),
    [selectedFiles]
  );

  const manualImageUrls = useMemo(
    () =>
      String(form.imageUrlsText || "")
        .split(/\r?\n/)
        .map((url) => url.trim())
        .filter(Boolean),
    [form.imageUrlsText]
  );

  useEffect(() => {
    return () => {
      previewUrls.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, [previewUrls]);

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onFileChange = (event) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles((prev) => [...prev, ...files]);
  };

  const removeImage = (indexToRemove) => {
    setSelectedFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedFiles([]);
    setError("");
    setSuccess("");
  };

  const onSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setSuccess("");
      setError("Product name is required.");
      return;
    }

    if (!form.category.trim()) {
      setSuccess("");
      setError("Please select a category.");
      return;
    }

    if (form.price === "" || Number(form.price) < 0) {
      setSuccess("");
      setError("Please enter a valid base price.");
      return;
    }

    if (form.quantity === "" || Number(form.quantity) < 0) {
      setSuccess("");
      setError("Please enter a valid quantity.");
      return;
    }

    try {
      const uploadedImageUrls = await Promise.all(selectedFiles.map((file) => fileToDataUrl(file)));
      const imageUrls = Array.from(new Set([...manualImageUrls, ...uploadedImageUrls]));
      await addProduct({ ...form, imageUrls });
      setForm(initialForm);
      setSelectedFiles([]);
      setError("");
      setSuccess("Product added successfully.");
    } catch (readError) {
      setSuccess("");
      setError(readError?.message || "Could not save product to backend.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Add Product</h1>
        <p className="mt-2 text-sm text-red-100">
          Create clean listings with category, pricing, and image upload.
        </p>
      </div>

      <form className="space-y-6" onSubmit={onSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">General Information</h2>
            <p className="mt-1 text-sm text-gray-500">Core details customers will see first.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  className={fieldClass}
                  name="name"
                  placeholder="e.g. Dell XPS 15"
                  value={form.name}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className={`${fieldClass} min-h-[140px] resize-y`}
                  name="description"
                  placeholder="Write key features, use-case, and target audience"
                  value={form.description}
                  onChange={onChange}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Product Media</h2>
            <p className="mt-1 text-sm text-gray-500">Upload local files or paste image URLs from trusted stores.</p>
            <div className="mt-5 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4">
              <label className="mb-2 block text-sm font-medium text-gray-700">Upload Product Images</label>
              <input
                accept="image/*"
                className={fieldClass}
                multiple
                type="file"
                onChange={onFileChange}
              />
            </div>

            {previewUrls.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {previewUrls.map((file, index) => (
                  <div key={file.key} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <img src={file.url} alt={file.name} className="h-24 w-full object-cover" />
                    <div className="flex items-center justify-between p-2">
                      <p className="truncate text-xs text-gray-600" title={file.name}>
                        {file.name}
                      </p>
                      <button
                        className="text-xs font-semibold text-red-600 hover:text-red-700"
                        type="button"
                        onClick={() => removeImage(index)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-700">Image URLs (one per line)</label>
              <textarea
                className={`${fieldClass} min-h-[110px] resize-y`}
                name="imageUrlsText"
                placeholder="https://m.media-amazon.com/images/...jpg"
                value={form.imageUrlsText}
                onChange={onChange}
              />
            </div>

            {manualImageUrls.length > 0 ? (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {manualImageUrls.slice(0, 9).map((url, index) => (
                  <div key={`${url}-${index}`} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <img src={url} alt={`URL preview ${index + 1}`} className="h-24 w-full object-cover" />
                    <div className="p-2">
                      <p className="truncate text-xs text-gray-600" title={url}>
                        URL Image {index + 1}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Pricing</h2>
            <p className="mt-1 text-sm text-gray-500">Set base price and optional discount.</p>
            <div className="mt-5 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Base Price</label>
                <input
                  className={fieldClass}
                  min="0"
                  name="price"
                  placeholder="0.00 (INR)"
                  step="0.01"
                  type="number"
                  value={form.price}
                  onChange={onChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  className={fieldClass}
                  max="100"
                  min="0"
                  name="discountPercentage"
                  placeholder="0"
                  type="number"
                  value={form.discountPercentage}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  className={fieldClass}
                  min="0"
                  name="quantity"
                  placeholder="0"
                  type="number"
                  value={form.quantity}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Product Position</label>
                <input
                  className={fieldClass}
                  min="0"
                  name="position"
                  placeholder="50 (default order)"
                  type="number"
                  value={form.position}
                  onChange={onChange}
                />
                <p className="mt-1 text-xs text-gray-500">Lower number appears first. Use 0 to pin at top.</p>
              </div>
              <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-red-700">
                Final Price (Auto): INR {finalPrice.toFixed(2)}
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-900">Category</h2>
            <p className="mt-1 text-sm text-gray-500">Map product to the right browsing section.</p>
            <div className="mt-5">
              <label className="mb-1 block text-sm font-medium text-gray-700">Product Category</label>
              <select className={fieldClass} name="category" value={form.category} onChange={onChange}>
                <option value="">Select category</option>
                {CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </section>
        </div>

        <div className="sticky bottom-3 z-10 rounded-2xl border border-red-100 bg-white/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <button
              className="rounded-xl bg-red-700 px-6 py-2.5 font-semibold text-white transition hover:bg-red-600"
              type="submit"
            >
              Add Product
            </button>
            <button
              className="rounded-xl bg-gray-100 px-6 py-2.5 font-semibold text-gray-700 transition hover:bg-gray-200"
              type="button"
              onClick={resetForm}
            >
              Reset
            </button>
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {success ? <p className="text-sm font-medium text-emerald-700">{success}</p> : null}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
