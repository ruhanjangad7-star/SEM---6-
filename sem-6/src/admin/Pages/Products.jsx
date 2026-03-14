import { useEffect, useMemo, useState } from "react";
import { deleteProduct, getProducts, normalizeCategory, updateProduct } from "../data/productStore";

const formatPrice = (value) => `INR ${Number(value || 0).toFixed(2)}`;
const MAX_IMAGE_DIMENSION = 1280;
const JPEG_QUALITY = 0.7;
const MAX_BASE64_LENGTH = 900000;

const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const ratio = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
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
          reject(new Error("Image is too large after compression. Choose a smaller image."));
          return;
        }

        resolve(dataUrl);
      };
      image.onerror = () => reject(new Error("Failed to process image."));
      image.src = String(reader.result || "");
    };
    reader.onerror = () => reject(new Error("Failed to read image."));
    reader.readAsDataURL(file);
  });

const getFinalPrice = (product) => {
  const price = Number(product.price) || 0;
  const discount = Math.min(100, Math.max(0, Number(product.discountPercentage) || 0));
  return Math.max(0, price - (price * discount) / 100);
};

const CANONICAL_CATEGORY_LABELS = {
  "battery backup": "Battery Backup",
  coding: "Coding",
  gaming: "Gaming",
  macbook: "Macbook",
  professional: "Professional",
  student: "Student",
  "thin & light": "Thin & Light",
};

const sortByPositionThenDate = (items) =>
  [...items].sort((a, b) => {
    const pos = (Number(a.position) || 0) - (Number(b.position) || 0);
    if (pos !== 0) return pos;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

const toCategoryLabel = (value) => {
  const key = normalizeCategory(String(value || ""));
  if (!key) return "";
  if (CANONICAL_CATEGORY_LABELS[key]) {
    return CANONICAL_CATEGORY_LABELS[key];
  }
  return key
    .split(" ")
    .filter(Boolean)
    .map((part) => {
      if (part === "&") return "&";
      return `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`;
    })
    .join(" ");
};

const parseImageUrlsText = (value) => {
  const raw = String(value || "");
  const lines = raw
    .split(/\r?\n/)
    .map((url) => url.trim())
    .filter(Boolean);

  // Backward compatibility for old comma-separated remote URLs (never split data URLs).
  if (
    lines.length === 1 &&
    lines[0].includes(",") &&
    !lines[0].toLowerCase().startsWith("data:")
  ) {
    return lines[0]
      .split(",")
      .map((url) => url.trim())
      .filter(Boolean);
  }

  return lines;
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    category: "",
    price: "",
    discountPercentage: "",
    quantity: "",
    position: "",
    imageUrlsText: "",
  });
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");
  const [editUploadingImages, setEditUploadingImages] = useState(false);
  const [positionUpdatingId, setPositionUpdatingId] = useState(null);
  const [draggingProductId, setDraggingProductId] = useState(null);
  const [dragOverProductId, setDragOverProductId] = useState(null);
  const [reorderSaving, setReorderSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const items = await getProducts({ includeOutOfStock: true });
        setProducts(sortByPositionThenDate(items));
      } catch {
        setError("Backend not connected. Start Flask on port 5000.");
      }
    })();
  }, []);

  const categoryOptions = useMemo(() => {
    const byKey = new Map();
    products.forEach((product) => {
      const raw = String(product.category || "").trim();
      const key = normalizeCategory(raw);
      if (!key || byKey.has(key)) return;
      byKey.set(key, toCategoryLabel(raw));
    });
    return Array.from(byKey.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [products]);

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase();
    return products.filter((product) => {
      const category = String(product.category || "").trim();
      const matchesCategory =
        selectedCategory === "all" ||
        normalizeCategory(category) === selectedCategory;
      const matchesSearch =
        !search ||
        String(product.name || "").toLowerCase().includes(search) ||
        category.toLowerCase().includes(search);

      return matchesCategory && matchesSearch;
    });
  }, [products, query, selectedCategory]);

  useEffect(() => {
    const validIds = new Set(products.map((product) => product.id));
    setSelectedProductIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [products]);

  const selectedIdSet = useMemo(() => new Set(selectedProductIds), [selectedProductIds]);
  const filteredProductIds = useMemo(
    () => filteredProducts.map((product) => product.id),
    [filteredProducts]
  );
  const allFilteredSelected =
    filteredProductIds.length > 0 && filteredProductIds.every((id) => selectedIdSet.has(id));

  const toggleSelectProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectAllFiltered = () => {
    setSelectedProductIds((prev) => {
      if (allFilteredSelected) {
        return prev.filter((id) => !filteredProductIds.includes(id));
      }
      const next = new Set(prev);
      filteredProductIds.forEach((id) => next.add(id));
      return Array.from(next);
    });
  };

  const onDeleteSelected = async () => {
    if (selectedProductIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(`Remove ${selectedProductIds.length} selected product(s)?`);
    if (!confirmed) return;

    const successIds = [];
    let failedCount = 0;

    // Use sequential deletes to avoid SQLite write-lock failures from concurrent requests.
    for (const productId of selectedProductIds) {
      try {
        await deleteProduct(productId);
        successIds.push(productId);
      } catch {
        failedCount += 1;
      }
    }

    if (successIds.length > 0) {
      setProducts((prev) => prev.filter((item) => !successIds.includes(item.id)));
      setSelectedProductIds((prev) => prev.filter((id) => !successIds.includes(id)));
    }

    if (failedCount > 0) {
      setError(`Deleted ${successIds.length} item(s). ${failedCount} item(s) could not be removed.`);
      return;
    }

    setError("");
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: String(product.name || ""),
      description: String(product.description || ""),
      category: toCategoryLabel(product.category),
      price: String(product.price ?? ""),
      discountPercentage: String(product.discountPercentage ?? ""),
      quantity: String(product.quantity ?? ""),
      position: String(product.position ?? 0),
      imageUrlsText: Array.isArray(product.imageUrls) ? product.imageUrls.join("\n") : "",
    });
    setEditError("");
    setEditSuccess("");
  };

  const closeEdit = () => {
    setEditingProduct(null);
    setEditError("");
    setEditSuccess("");
  };

  const onEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const onEditFileChange = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    try {
      setEditUploadingImages(true);
      const converted = await Promise.all(files.map((file) => fileToDataUrl(file)));
      setEditForm((prev) => {
        const current = parseImageUrlsText(prev.imageUrlsText);
        const next = [...current, ...converted];
        return { ...prev, imageUrlsText: next.join("\n") };
      });
      setEditError("");
      setEditSuccess("Image(s) added from local file.");
    } catch (readError) {
      setEditSuccess("");
      setEditError(readError?.message || "Could not process selected image.");
    } finally {
      event.target.value = "";
      setEditUploadingImages(false);
    }
  };

  const removeEditImageAt = (indexToRemove) => {
    setEditForm((prev) => {
      const list = parseImageUrlsText(prev.imageUrlsText)
        .filter(Boolean)
        .filter((_, index) => index !== indexToRemove);
      return { ...prev, imageUrlsText: list.join("\n") };
    });
  };

  const onSaveEdit = async () => {
    if (!editingProduct) {
      return;
    }

    if (!editForm.name.trim()) {
      setEditError("Product name is required.");
      return;
    }

    if (!editForm.category.trim()) {
      setEditError("Category is required.");
      return;
    }

    if (editForm.price === "" || Number(editForm.price) < 0) {
      setEditError("Enter a valid price.");
      return;
    }

    if (editForm.quantity === "" || Number(editForm.quantity) < 0) {
      setEditError("Enter a valid quantity.");
      return;
    }
    if (editForm.position !== "" && Number(editForm.position) < 0) {
      setEditError("Enter a valid product position.");
      return;
    }

    try {
      const imageUrls =
        Array.isArray(editForm.imageUrlsText)
          ? []
          : parseImageUrlsText(editForm.imageUrlsText);

      const updated = await updateProduct(editingProduct.id, { ...editForm, imageUrls });
      setProducts((prev) =>
        sortByPositionThenDate(prev.map((item) => (item.id === updated.id ? updated : item)))
      );
      setEditError("");
      setEditSuccess("Product updated successfully.");
      setTimeout(() => {
        closeEdit();
      }, 600);
    } catch (saveError) {
      setEditSuccess("");
      setEditError(saveError?.message || "Could not update product.");
    }
  };

  const editBasePrice = Number(editForm.price) || 0;
  const editDiscount = Math.min(100, Math.max(0, Number(editForm.discountPercentage) || 0));
  const editFinalPrice = Math.max(0, editBasePrice - (editBasePrice * editDiscount) / 100);
  const editImageList = useMemo(
    () => parseImageUrlsText(editForm.imageUrlsText),
    [editForm.imageUrlsText]
  );

  const onQuickSetPosition = async (product, nextPosition) => {
    const safePosition = Math.max(0, Number(nextPosition) || 0);
    try {
      setPositionUpdatingId(product.id);
      const updated = await updateProduct(product.id, {
        ...product,
        position: safePosition,
        imageUrls: Array.isArray(product.imageUrls) ? product.imageUrls : [],
      });
      setProducts((prev) =>
        sortByPositionThenDate(prev.map((item) => (item.id === updated.id ? updated : item)))
      );
      setError("");
    } catch (err) {
      setError(err?.message || "Could not update product position.");
    } finally {
      setPositionUpdatingId(null);
    }
  };

  const onDropReorder = async (targetProductId) => {
    if (!draggingProductId || draggingProductId === targetProductId || reorderSaving) {
      return;
    }

    const sourceIndex = filteredProducts.findIndex((item) => item.id === draggingProductId);
    const targetIndex = filteredProducts.findIndex((item) => item.id === targetProductId);
    if (sourceIndex < 0 || targetIndex < 0) {
      return;
    }

    const reorderedFiltered = [...filteredProducts];
    const [moved] = reorderedFiltered.splice(sourceIndex, 1);
    const insertIndex = sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    reorderedFiltered.splice(insertIndex, 0, moved);

    const positionById = new Map(
      reorderedFiltered.map((item, index) => [item.id, index])
    );

    const nextProducts = sortByPositionThenDate(
      products.map((item) =>
        positionById.has(item.id)
          ? { ...item, position: positionById.get(item.id) }
          : item
      )
    );

    setProducts(nextProducts);
    setDraggingProductId(null);
    setDragOverProductId(null);
    setReorderSaving(true);

    try {
      for (const item of reorderedFiltered) {
        const nextPosition = positionById.get(item.id) ?? 0;
        if (Number(item.position || 0) === Number(nextPosition)) {
          continue;
        }

        await updateProduct(item.id, {
          ...item,
          position: nextPosition,
          imageUrls: Array.isArray(item.imageUrls) ? item.imageUrls : [],
        });
      }
      setError("");
    } catch (err) {
      setError(err?.message || "Could not save drag-and-drop order.");
      try {
        const fresh = await getProducts({ includeOutOfStock: true });
        setProducts(sortByPositionThenDate(fresh));
      } catch {
        // Keep existing UI state if refresh fails.
      }
    } finally {
      setReorderSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-red-700 to-red-500 p-6 text-white shadow">
        <h1 className="text-3xl font-bold">Products</h1>
        <p className="mt-2 text-sm text-red-100">View, edit, and search all products added from admin.</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-medium text-gray-500">
          Tip: Drag any product row and drop it where you want. Dropping on first row pins it to top.
        </p>
        <div className="grid gap-3 md:grid-cols-[1fr_240px_auto]">
          <input
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            placeholder="Search by product or category"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
          >
            <option value="all">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category.key} value={category.key}>
                {category.label}
              </option>
            ))}
          </select>
          <button
            className="rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={selectedProductIds.length === 0}
            onClick={onDeleteSelected}
            type="button"
          >
            Delete Selected ({selectedProductIds.length})
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full min-w-[980px]">
          <thead className="bg-gray-50 text-left text-sm text-gray-700">
            <tr>
              <th className="px-4 py-3">
                <input
                  aria-label="Select all filtered products"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAllFiltered}
                  type="checkbox"
                />
              </th>
              <th className="px-4 py-3">Image</th>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Position</th>
              <th className="px-4 py-3">Original</th>
              <th className="px-4 py-3">Final</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td className="px-4 py-7 text-sm text-gray-500" colSpan={9}>
                  No products found.
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => {
                const image = Array.isArray(product.imageUrls) ? product.imageUrls[0] : "";
                return (
                  <tr
                    className={[
                      "border-t border-gray-100",
                      dragOverProductId === product.id && draggingProductId !== product.id
                        ? "bg-amber-50"
                        : "",
                      reorderSaving ? "opacity-70" : "",
                    ].join(" ")}
                    draggable={!reorderSaving}
                    key={product.id}
                    onDragEnd={() => {
                      setDraggingProductId(null);
                      setDragOverProductId(null);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (dragOverProductId !== product.id) {
                        setDragOverProductId(product.id);
                      }
                    }}
                    onDragStart={() => {
                      setDraggingProductId(product.id);
                      setDragOverProductId(product.id);
                    }}
                    onDrop={async (event) => {
                      event.preventDefault();
                      await onDropReorder(product.id);
                    }}
                  >
                    <td className="px-4 py-3">
                      <input
                        aria-label={`Select ${product.name}`}
                        checked={selectedIdSet.has(product.id)}
                        onChange={() => toggleSelectProduct(product.id)}
                        type="checkbox"
                      />
                    </td>
                    <td className="px-4 py-3">
                      {image ? (
                        <img src={image} alt={product.name} className="h-14 w-20 rounded-lg border border-gray-200 object-cover" />
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-500">
                          No image
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
                    <td className="px-4 py-3">{toCategoryLabel(product.category)}</td>
                    <td className="px-4 py-3">{Number(product.quantity || 0)}</td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
                        <button
                          className="h-7 w-7 rounded-md bg-white text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={positionUpdatingId === product.id}
                          onClick={() => onQuickSetPosition(product, Number(product.position || 0) - 1)}
                          type="button"
                        >
                          -
                        </button>
                        <span className="min-w-[34px] text-center text-sm font-semibold text-gray-800">
                          {Number(product.position || 0)}
                        </span>
                        <button
                          className="h-7 w-7 rounded-md bg-white text-sm font-bold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                          disabled={positionUpdatingId === product.id}
                          onClick={() => onQuickSetPosition(product, Number(product.position || 0) + 1)}
                          type="button"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3 font-semibold text-red-700">{formatPrice(getFinalPrice(product))}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          className="rounded-lg bg-red-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600"
                          onClick={() => openEdit(product)}
                          type="button"
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={positionUpdatingId === product.id}
                          onClick={() => onQuickSetPosition(product, 0)}
                          type="button"
                        >
                          Top
                        </button>
                        <button
                          aria-label="Remove product"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white hover:bg-black"
                          onClick={async () => {
                            const confirmed = window.confirm(`Remove ${product.name}?`);
                            if (!confirmed) return;
                            try {
                              await deleteProduct(product.id);
                              setProducts((prev) => prev.filter((item) => item.id !== product.id));
                              setError("");
                            } catch (deleteError) {
                              setError(deleteError?.message || "Could not remove product.");
                            }
                          }}
                          type="button"
                        >
                          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M8 6V4h8v2" />
                            <path d="M19 6l-1 14H6L5 6" />
                            <path d="M10 11v6" />
                            <path d="M14 11v6" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {editingProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-900">Edit Product</h2>
            <p className="mt-1 text-sm text-gray-600">Update product details and save changes.</p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Image URLs (one per line)</label>
                <input
                  accept="image/*"
                  className="mb-2 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  multiple
                  type="file"
                  onChange={onEditFileChange}
                />
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  name="imageUrlsText"
                  rows={3}
                  placeholder="https://.../image1.jpg&#10;https://.../image2.jpg"
                  value={editForm.imageUrlsText}
                  onChange={onEditChange}
                />
                {editUploadingImages ? (
                  <p className="mt-1 text-xs text-gray-500">Processing selected images...</p>
                ) : null}
                {editImageList.length > 0 ? (
                  <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {editImageList.slice(0, 6).map((url, index) => (
                      <div className="overflow-hidden rounded-lg border border-gray-200" key={`${url}-${index}`}>
                        <img alt={`Product preview ${index + 1}`} className="h-20 w-full object-cover" src={url} />
                        <button
                          className="w-full bg-gray-50 py-1 text-xs font-semibold text-red-700 hover:bg-red-50"
                          onClick={() => removeEditImageAt(index)}
                          type="button"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Product Name</label>
                <input className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" name="name" value={editForm.name} onChange={onEditChange} />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  name="description"
                  rows={3}
                  value={editForm.description}
                  onChange={onEditChange}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Category</label>
                <select className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" name="category" value={editForm.category} onChange={onEditChange}>
                  <option value="">Select category</option>
                  {categoryOptions.map((option) => (
                    <option key={option.key} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Quantity</label>
                <input className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" min="0" name="quantity" type="number" value={editForm.quantity} onChange={onEditChange} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Product Position</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  min="0"
                  name="position"
                  placeholder="50 (default order)"
                  type="number"
                  value={editForm.position}
                  onChange={onEditChange}
                />
                <p className="mt-1 text-xs text-gray-500">Lower number appears first. Use 0 to pin at top.</p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Base Price</label>
                <input className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" min="0" name="price" step="0.01" type="number" value={editForm.price} onChange={onEditChange} />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Discount (%)</label>
                <input
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"
                  min="0"
                  max="100"
                  name="discountPercentage"
                  type="number"
                  value={editForm.discountPercentage}
                  onChange={onEditChange}
                />
              </div>

              <div className="sm:col-span-2">
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-semibold text-red-700">
                  Final Price (Auto): INR {editFinalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {editError ? <p className="mt-3 text-sm text-red-600">{editError}</p> : null}
            {editSuccess ? <p className="mt-3 text-sm text-emerald-700">{editSuccess}</p> : null}

            <div className="mt-5 flex items-center justify-end gap-2">
              <button className="rounded-xl bg-gray-100 px-4 py-2 font-semibold text-gray-700 hover:bg-gray-200" onClick={closeEdit} type="button">
                Cancel
              </button>
              <button className="rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-600" onClick={onSaveEdit} type="button">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Products;
