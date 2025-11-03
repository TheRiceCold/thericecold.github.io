const
  menu = document.getElementById('menuBtn'),
  overlay = document.getElementById('overlay'),
  mobileSidebar = document.getElementById('mobileSidebar');

for (const b of document.querySelectorAll('#langBtn'))
  b.onclick = langStore.next

// Theme
for (const b of document.querySelectorAll('#themeBtn'))
  b.onclick = themeStore.next

// Mobile Sidebar
menu.onclick = () => { mobileSidebar.classList.toggle('show'); overlay.classList.toggle('show') }
overlay.onclick = () => { mobileSidebar.classList.remove('show'); overlay.classList.remove('show') }

// Sidebar Dropdown Menu
langStore.onRebind(() => {
  for(const b of document.querySelectorAll('#dropdownBtn'))
    b.onclick = () => b.nextElementSibling.classList.toggle('show')
})

langStore.init()
themeStore.apply()
