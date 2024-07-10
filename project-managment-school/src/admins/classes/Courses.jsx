import React from "react";
import SmallCard from "../../components/adminsCompnents/navbar/SmallCard";

function Courses() {
  const [addCourses, setAddCourses] = React.useState(false);
  const handelAdd = () => {
    setAddCourses(false);
  };
  const handelCancel = () => {
    setAddCourses(false);
  };

  return (
    <div
      className={`max-w-[1000px] duration-200 relative  w-full mx-auto ${
        addCourses ? " bg-opacity-30" : ""
      }`}
    >
      <div
        style={addCourses ? { filter: "blur(2px)" } : {}}
        className="w-full h-28 py-10 mx-auto text-center text-gray-800 text-4xl font-semibold font-['Cairo'] leading-10"
      >
        الدورات الموجودة
      </div>
      <div
        style={addCourses ? { filter: "blur(2px)" } : {}}
        className=" flex w-full justify-center items-center flex-wrap gap-10"
      >
        <SmallCard text=" البرمجة " />
        <SmallCard text=" الروبتيك " />
      </div>
      <div
        style={addCourses ? { filter: "blur(2px)" } : {}}
        className="w-full flex justify-center items-center my-10"
      >
        <div
          onClick={() => setAddCourses(!addCourses)}
          className="w-96 h-16 px-8 py-4 hover:bg-blue-600 cursor-pointer bg-indigo-500 rounded-2xl flex justify-center items-center gap-2"
        >
          <div className="text-right text-white text-2xl font-semibold font-['Cairo'] leading-9">
            اضافة دورة
          </div>
        </div>
      </div>
      {addCourses && (
        <div className="w-96   h-80 px-12 py-20 top-[10%] left-[30%]  absolute  bg-gray-200 rounded-3xl justify-start items-center inline-flex">
          <div className="w-96 self-stretch flex-col justify-start items-end gap-4 inline-flex">
            <div className="self-stretch text-center text-gray-800 text-3xl font-semibold font-['Cairo'] leading-10">
              إضافة دورة
            </div>
            <input className=" w-full focus:outline-none  px-8 py-2 rounded-lg border border-black/opacity-70 justify-end items-center gap-2" />

            <div
              onClick={handelAdd}
              className="self-stretch cursor-pointer px-8 py-2 bg-indigo-500 rounded-2xl justify-center items-center gap-2 inline-flex"
            >
              <div className="text-right text-white text-base font-semibold font-['Cairo'] leading-normal">
                اضافة{" "}
              </div>
            </div>
            <div
              onClick={handelCancel}
              className="self-stretch cursor-pointer px-8 py-2 bg-red-600 rounded-2xl justify-center items-center gap-2 inline-flex"
            >
              <div className="text-right text-white text-base font-semibold font-['Cairo'] leading-normal">
                الغاء
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Courses;
