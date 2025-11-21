import { Button, Spinner, Textarea } from "@nextui-org/react";
import React from "react";
import { sendMessage } from "../../apiCalls/messageCalls";
import { useSelector } from "react-redux";
import { selectAuth } from "../../Redux/slices/authSlice";
import Swal from "sweetalert2";

function SendReport() {
  const [message, setMessage] = React.useState("");
  const { user } = useSelector(selectAuth);
  const [loading, setLoading] = React.useState(false);

  const handleSendReport = async () => {
    if (message.trim() === "") return; // Prevent sending empty content
    console.log(message, user?.id);
    setLoading(true);

    const res = await sendMessage(message, user?.id);

    if (res) {
      Swal.fire({
        icon: "success",
        title: "تم الارسال بنجاح",
        showConfirmButton: false,
        timer: 1500,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "حدث خطأ ما",
        showConfirmButton: false,
        timer: 1500,
      });
    }
    setLoading(false);
    setMessage(""); // Clear the message after sending
  };

  return (
    <div>
      <div>
        <h1
          className="
          text-center
          text-4xl
          font-bold
          text-primary
          mt-4
          mb-8
        "
        >
          الابلاغ عن مشكلة
        </h1>
      </div>
      <div
        className="
        flex
        flex-col
        items-center
        justify-center
        space-y-4
        px-4
      "
      >
        <Textarea
          label="التقرير"
          variant="bordered"
          placeholder="اكتب التقرير هنا"
          disableAnimation
          disableAutosize
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          classNames={{
            base: "md:w-1/2",
            input: "resize-y min-h-[60px]",
          }}
        />

        <Button
          onClick={handleSendReport}
          auto
          rounded
          color="primary"
          className="mt-4"
          disabled={loading || message.trim() === ""}
        >
          {loading ? <Spinner /> : "ارسال"}
        </Button>
      </div>
    </div>
  );
}

export default SendReport;
