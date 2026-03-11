"use client";

import {
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";

const categories = [
  "T-shirts",
  "Shoes",
  "Accessories",
  "Bags",
  "Dresses",
  "Jackets",
  "Gloves",
] as const;

const colors = [
  "blue",
  "green",
  "red",
  "yellow",
  "purple",
  "orange",
  "pink",
  "brown",
  "gray",
  "black",
  "white",
] as const;

const sizes = [
  "xs",
  "s",
  "m",
  "l",
  "xl",
  "xxl",
  "34",
  "35",
  "36",
  "37",
  "38",
  "39",
  "40",
  "41",
  "42",
  "43",
  "44",
  "45",
  "46",
  "47",
  "48",
] as const;

const formSchema = z.object({
  name: z.string().min(1, { message: "Product name is required!" }),
  shortDescription: z
    .string()
    .min(1, { message: "Short description is required!" })
    .max(60),
  description: z.string().min(1, { message: "Description is required!" }),
  price: z.number().min(1, { message: "Price is required!" }),
  category: z.enum(categories),
  sizes: z.array(z.enum(sizes)),
  colors: z.array(z.enum(colors)),
  images: z.record(z.enum(colors), z.any()),
});

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

const AddProduct = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      price: 0,
      sizes: [],
      colors: [],
      images: {},
    },
  });

  const [uploading, setUploading] = useState(false);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setUploading(true);

      // Handle image uploads mapped to colors
      const uploadedImages: Record<string, string> = { ...data.images };

      const filePromises = data.colors.map(async (color) => {
        // If there is an active File Blob stored in form state for this color, upload it!
        const file = data.images[color] as any;
        if (file instanceof File) {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("color", color);

          const res = await fetch("/api/upload", {
            method: "POST",
            body: formData, // Notice: No Content-Type header so browser sets multipart boundary
          });

          if (!res.ok) throw new Error("Upload failed");
          
          const result = await res.json();
          uploadedImages[color] = result.url; // Overwrite the File Blob with the string URL
        }
      });

      await Promise.all(filePromises);

      const payload = {
        ...data,
        images: uploadedImages
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create product");
      toast.success("Product created!");
      router.refresh();
      form.reset();
    } catch (err: any) {
      toast.error(err.message || "Error creating product");
    } finally {
      setUploading(false);
    }
  };

  return (
    <SheetContent>
      <ScrollArea className="h-screen">
        <SheetHeader>
          <SheetTitle className="mb-4">Add Product</SheetTitle>
          <SheetDescription asChild>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the name of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="shortDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the short description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter the description of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the price of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormDescription>
                        Enter the category of the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sizes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sizes</FormLabel>
                      <FormControl>
                        <div className="grid grid-cols-3 gap-4 my-2">
                          {sizes.map((size) => (
                            <div className="flex items-center gap-2" key={size}>
                              <Checkbox
                                id="size"
                                checked={field.value?.includes(size)}
                                onCheckedChange={(checked) => {
                                  const currentValues = field.value || [];
                                  if (checked) {
                                    field.onChange([...currentValues, size]);
                                  } else {
                                    field.onChange(
                                      currentValues.filter((v) => v !== size)
                                    );
                                  }
                                }}
                              />
                              <label htmlFor="size" className="text-xs">
                                {size}
                              </label>
                            </div>
                          ))}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available sizes for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="colors"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold text-cyan-700 mt-6">Product Colors & Images</FormLabel>
                      <FormDescription className="text-xs pb-2 border-b">
                        Select colors and upload a specific product photo for each color variant.
                      </FormDescription>
                      <FormControl>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                            {colors.map((color) => (
                              <div
                                className="flex flex-col gap-3 p-3 border rounded-md"
                                key={color}
                              >
                                <div className="flex items-center gap-2">
                                  <Checkbox
                                    id={`color-${color}`}
                                    checked={field.value?.includes(color)}
                                    onCheckedChange={(checked) => {
                                      const currentValues = field.value || [];
                                      if (checked) {
                                        field.onChange([...currentValues, color]);
                                      } else {
                                        field.onChange(
                                          currentValues.filter((v) => v !== color)
                                        );
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`color-${color}`}
                                    className="text-xs font-semibold flex items-center gap-2"
                                  >
                                    <div
                                      className="w-3 h-3 rounded-full"
                                      style={{ backgroundColor: color }}
                                    />
                                    {color}
                                  </label>
                                </div>
                                <Input 
                                  type="file" 
                                  accept="image/*" 
                                  className="text-xs h-8 cursor-pointer"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      // Auto-check this color if they pick an image
                                      const currentValues = form.getValues("colors") || [];
                                      if (!currentValues.includes(color)) {
                                        form.setValue("colors", [...currentValues, color]);
                                      }
                                      const prevImages = form.getValues("images");
                                      form.setValue("images", { ...prevImages, [color]: file as any });
                                    }
                                  }}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Select the available colors for the product.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading..." : "Submit"}
                </Button>
              </form>
            </Form>
          </SheetDescription>
        </SheetHeader>
      </ScrollArea>
    </SheetContent>
  );
};

export default AddProduct;
