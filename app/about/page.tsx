import Navbar from '../components/Navbar';

export default function About() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Animated background effect */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/50 to-white"></div>
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 flex-grow px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-6xl mx-auto">
          {/* About Section */}
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-medium mb-2 block">درباره ما</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              درباره انجمن
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-8"></div>
            <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
              انجمن علوم کامپیوتر دانشگاه بناب با هدف ارتقای سطح علمی دانشجویان و ایجاد فضای مناسب برای تبادل دانش و تجربیات در حوزه علوم کامپیوتر تأسیس شده است.
            </p>
          </div>

          {/* Vision & Mission */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mb-6">
                <i className="fas fa-eye text-2xl text-white"></i>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">چشم‌انداز ما</h2>
              <p className="text-gray-600 leading-relaxed">
                تبدیل شدن به یک انجمن علمی پیشرو در دانشگاه بناب و ایجاد فضای مناسب برای رشد و توسعه دانشجویان در حوزه علوم کامپیوتر.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center mb-6">
                <i className="fas fa-bullseye text-2xl text-white"></i>
              </div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900">مأموریت ما</h2>
              <p className="text-gray-600 leading-relaxed">
                توانمندسازی دانشجویان در حوزه‌های تخصصی علوم کامپیوتر، ایجاد فرصت‌های یادگیری و رشد، و تسهیل ارتباط با متخصصان صنعت.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              تیم انجمن
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-12"></div>

            <div className="bg-white rounded-xl p-8 border border-gray-100 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 max-w-2xl mx-auto">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-6 flex items-center justify-center animate-pulse">
                <i className="fas fa-users text-3xl text-white"></i>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">به زودی</h3>
              <p className="text-gray-600">اطلاعات اعضای تیم انجمن به زودی در این بخش قرار خواهد گرفت</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-20 bg-white py-8 border-t border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0 space-x-3 rtl:space-x-reverse">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-center">
                <i className="fas fa-microchip text-xl text-white"></i>
              </div>
              <span className="text-gray-900 font-bold">انجمن علوم کامپیوتر دانشگاه بناب</span>
            </div>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} - تمامی حقوق محفوظ است
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}