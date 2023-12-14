import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { name } = body;
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized!" }), {
        status: 401,
      });
    }

    if (!name) {
      return new NextResponse(
        JSON.stringify({ message: "Name is Required!" }),
        { status: 400 }
      );
    }
    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "StoreId is Required!" }),
        { status: 400 }
      );
    }

    // console.log(params.storeId);

    const store = await prismadb.store.update({
      where: {
        id: params.storeId,
        userId,
      },
      data: {
        name,
      },
    });
    return NextResponse.json(store);
  } catch (error) {
    console.log("STORES_PATCH", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized!" }), {
        status: 401,
      });
    }

    if (!params.storeId) {
      return new NextResponse(
        JSON.stringify({ message: "StoreId is Required!" }),
        { status: 400 }
      );
    }

    const store = await prismadb.store.delete({
      where: {
        id: params.storeId,
        userId,
      },
    });
    return NextResponse.json(store);
  } catch (error) {
    console.log("STORES_DELETE", error);
    return new NextResponse(
      JSON.stringify({ message: "Internal Server Error!" }),
      { status: 500 }
    );
  }
}
