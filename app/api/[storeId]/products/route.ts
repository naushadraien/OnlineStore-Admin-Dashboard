import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const colorId = searchParams.get("colorId") || undefined;
    const sizeId = searchParams.get("sizeId") || undefined;
    const isFeatured = searchParams.get("isFeatured") || undefined;

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    // console.log(params.storeId);

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // console.log(store);

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId }: { userId: string | null } = auth();
    const body = await req.json();
    const {
      name,
      price,
      images,
      categoryId,
      colorId,
      sizeId,
      isArchived,
      isFeatured,
    } = body;
    if (!userId) {
      return new NextResponse("Unauthenticated!", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Name is Required!", { status: 400 });
    }
    if (!price) {
      return new NextResponse("Price is Required!", { status: 400 });
    }
    if (!images || !images.length) {
      return new NextResponse("images is Required!", { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse("Category Id is Required!", { status: 400 });
    }
    if (!colorId) {
      return new NextResponse("Color Id is Required!", { status: 400 });
    }
    if (!sizeId) {
      return new NextResponse("Size Id is Required!", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized!", { status: 403 });
    }

    // console.log(params.storeId);

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        categoryId,
        colorId,
        sizeId,
        isArchived,
        isFeatured,
        storeId: params.storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    // console.log(store);

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
