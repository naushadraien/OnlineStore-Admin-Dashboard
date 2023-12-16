import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { colorId: string } }
) {
  try {
    if (!params.colorId) {
      return new NextResponse("Color Id is Required!", { status: 400 });
    }

    const color = await prismadb.color.findUnique({
      where: {
        id: params.colorId,
      },
    });
    return NextResponse.json(color);
  } catch (error) {
    console.log("COLOR_GET", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name, value } = body;
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated!" }), {
        status: 401,
      });
    }

    if (!name) {
      return new NextResponse(
        JSON.stringify({ message: "Name is Required!" }),
        { status: 400 }
      );
    }
    if (!value) {
      return new NextResponse(
        JSON.stringify({ message: "Value is Required!" }),
        { status: 400 }
      );
    }
    if (!params.colorId) {
      return new NextResponse(
        JSON.stringify({ message: "color Id is Required!" }),
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

    const color = await prismadb.color.update({
      where: {
        id: params.colorId,
      },
      data: {
        name,
        value,
      },
    });
    return NextResponse.json(color);
  } catch (error) {
    console.log("COLOR_PATCH", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; colorId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "Unauthenticated!" }), {
        status: 401,
      });
    }

    if (!params.colorId) {
      return new NextResponse("Billoard Id is Required!", { status: 400 });
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

    const color = await prismadb.color.delete({
      where: {
        id: params.colorId,
      },
    });
    return NextResponse.json(color);
  } catch (error) {
    console.log("COLOR_DELETE", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}
