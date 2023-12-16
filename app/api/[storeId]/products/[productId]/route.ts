import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product Id is Required!", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        category: true,
        size: true,
        color: true,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("PRODUCT_GET", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
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
    if (!params.productId) {
      return new NextResponse(
        JSON.stringify({ message: "Product Id is Required!" }),
        { status: 400 }
      );
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

    await prismadb.product.update({
      where: {
        id: params.productId,
      },
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
          deleteMany: {},
        },
      },
    });

    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("PRODUCT_PATCH", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated!" }), {
        status: 401,
      });
    }

    if (!params.productId) {
      return new NextResponse("Product Id is Required!", { status: 400 });
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

    const product = await prismadb.product.delete({
      where: {
        id: params.productId,
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("PRODUCT_DELETE", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}
