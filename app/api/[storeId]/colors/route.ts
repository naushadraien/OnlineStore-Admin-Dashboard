import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store Id is required", { status: 400 });
    }

    // console.log(params.storeId);

    const colors = await prismadb.color.findMany({
      where: {
        id: params.storeId,
      },
    });

    // console.log(store);

    return NextResponse.json(colors);
  } catch (error) {
    console.log("[COLORS_GET]", error);
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
    const { name, value }: { name: string; value: string } = body;
    if (!userId) {
      return new NextResponse("Unauthenticated!", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Name is Required!", { status: 400 });
    }
    if (!value) {
      return new NextResponse("Value is Required!", { status: 400 });
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

    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId,
      },
    });

    // console.log(store);

    return NextResponse.json(color);
  } catch (error) {
    console.log("[colors_POST]", error);
    return new NextResponse("Internal Server Error!", { status: 500 });
  }
}
