package com.example.colorimage.carousel

import android.app.AlertDialog
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.annotation.RequiresApi
import androidx.viewpager.widget.ViewPager
import com.example.colorimage.*
import com.example.colorimage.http.AddDrawingRequest
import com.example.colorimage.http.CreateDrawingRequest
import com.example.colorimage.http.CreateDrawingRequestProtected
import com.example.colorimage.http.Drawing
import com.google.android.material.switchmaterial.SwitchMaterial
import com.google.gson.Gson
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.text.SimpleDateFormat
import java.util.*


class CarouselActivity : BaseActivity() {
    var mViewPager: ViewPager? = null
    var albumName: String? = null
    var drawingsList = mutableListOf<Drawing>()
    var useremail: String? = null




    suspend fun updateDrawings(albumName: String, isForAdapter: Boolean) {
        val placeholder = findViewById<TextView>(R.id.placeholder)
            if (isForAdapter) {
                var x = httpService.getDrawingsInAlbum(albumName)!!
                if (x.isEmpty()) x = httpService.getDrawingsInAlbum(albumName)!!
                mViewPagerAdapter!!.drawingsList = x
                if (mViewPagerAdapter!!.drawingsList.isNotEmpty()) {

                    runOnUiThread {
                        placeholder.visibility = View.GONE
                        mViewPagerAdapter!!.notifyDataSetChanged()
                    }
                } else {
                    runOnUiThread {
                        placeholder.text = getStr(R.string.no_drawing)
                        placeholder.visibility = View.VISIBLE
                        mViewPagerAdapter!!.notifyDataSetChanged()
                    }
                }
            } else {
                drawingsList = httpService.getDrawingsInAlbum(albumName)!!
            }
    }

    private fun setDrawingEvents() {
        SocketHandler.mSocket?.on("VISIBILITYCHANGED") { event ->
            runBlocking {
                launch {
                    updateDrawings(albumName!!, true)
                }
            }
        }
        SocketHandler.mSocket?.on("DRAWINGMODIFIED") { event ->

            runBlocking {
                launch {
                    updateDrawings(albumName!!, true)
                }
            }
        }

        SocketHandler.mSocket?.on("JOINDRAWING") { event ->
            val jsonString = event[0].toString()
            runBlocking {
                launch {
                    updateDrawings(albumName!!, true)
                }
            }
        }

        SocketHandler.mSocket?.on("LEAVEDRAWING") { event ->
            val jsonString = event[0].toString()
            runBlocking {
                launch {
                    updateDrawings(albumName!!, true)
                }
            }
        }
        SocketHandler.mSocket?.on("DRAWINGCREATED") { event ->
            val jsonString = event[0].toString()


                        runBlocking {
                            launch {
                        updateDrawings(albumName!!, true)
                            }
                        }


        }
        SocketHandler.mSocket?.on("DRAWINGDELETED") { event ->
            val jsonString = event[0].toString()
            runBlocking {
                launch {
                    updateDrawings(albumName!!, true)
                }
            }
        }
    }


    private fun setCreateDrawingPrompt(albumName: String) {
        val createButton= findViewById<Button>(R.id.create_button)
        createButton.setOnClickListener {
            val builder = AlertDialog.Builder(this)
            val inflater = layoutInflater
            val dialogLayout = inflater.inflate(R.layout.create_drawing_prompt, null)
            val drawingNameEditText =
                dialogLayout.findViewById<EditText>(R.id.drawing_name_text_edit)

            val protection_input =
                dialogLayout.findViewById<EditText>(R.id.text_input_pass_prot)
            if (albumName == "PUBLIC") {
                val protectionSwitch =
                    dialogLayout.findViewById<SwitchMaterial>(R.id.protection_switch)
                protectionSwitch.visibility = View.VISIBLE
                protectionSwitch.setOnCheckedChangeListener { buttonView, isChecked ->
                    if (isChecked) {
                        protection_input.visibility = View.VISIBLE
                    } else {
                        protection_input.visibility = View.GONE
                    }
                }
                protectionSwitch.text = getStr(R.string.add_protection)
                protection_input.hint = getStr(R.string.enter_password_protection)
            }

            drawingNameEditText.hint = languageManager.localizedContext!!.getString(R.string.enter_drawing_name)


            with(builder) {
                runOnUiThread {
                    setTitle(languageManager.localizedContext!!.getString(
                        R.string.create_drawing
                    ))
                    setPositiveButton(languageManager.localizedContext!!.getString(R.string.create)) { dialog, which ->
                        runBlocking {
                            val createDrawingRequest = CreateDrawingRequest(
                                drawingNameEditText.text.toString(),
                                useremail!!,
                                if (albumName == "PUBLIC") "public" else "private"
                            )
                            val createDrawingRequestProtected = CreateDrawingRequestProtected(
                                drawingNameEditText.text.toString(),
                                useremail!!,
                                "protected",
                                protection_input.text.toString()
                            )

                            if(protection_input.text.isEmpty() && drawingNameEditText.text.isEmpty()) {
                                onErrorClick(getStr(R.string.no_empty_field), R.raw.ui2)
                            } else if (protection_input.text.isNotEmpty()) {
                               httpService.createDrawing(createDrawingRequestProtected)
                            } else {
                                httpService.createDrawing(createDrawingRequest)
                            }
                            val addDrawingRequest = AddDrawingRequest(
                                drawingNameEditText.text.toString(),
                                useremail!!,
                                albumName
                            )
                            val y = httpService.addDrawing(addDrawingRequest)
                            updateDrawings(albumName, true)
                        }
                    }
                    setNegativeButton(languageManager.localizedContext!!.getString(R.string.cancel)) { dialog, which -> }
                    setView(dialogLayout)
                    show()
                }
            }
        }
    }









    private fun setFilterDrawingPrompt() {
        val filterButton= findViewById<Button>(R.id.filter_drawings_button)
        filterButton.text = getStr(R.string.filter)
        filterButton.setOnClickListener {
            val builder = AlertDialog.Builder(this)
            val inflater = layoutInflater
            val dialogLayout = inflater.inflate(R.layout.filter_drawings_prompt, null)
            val filterTermEditText =
                dialogLayout.findViewById<EditText>(R.id.filter_drawings_text_edit)

            with(builder) {
                runOnUiThread {
                    setTitle(getStr(R.string.filter_drawings))
                    setPositiveButton(getStr(R.string.filter)) { dialog, which ->
                        if (filterTermEditText.text.toString().isNotEmpty()) {
                            runBlocking {
                                launch {
                                    var x = httpService.getDrawingsInAlbum(albumName!!)!!
                                    mViewPagerAdapter!!.drawingsList = filterDrawings(x, filterTermEditText.text.toString())
                                    runOnUiThread {
                                        mViewPagerAdapter!!.notifyDataSetChanged()
                                    }
                                }
                            }
                        } else {
                            onErrorClick(getStr(R.string.no_filter), R.raw.ui2 )
                            runBlocking {
                                updateDrawings(albumName!!, true)
                            }

                        }
                    }
                    setNegativeButton(getStr(R.string.cancel)) { dialog, which -> }
                    setView(dialogLayout)
                    show()
                }
            }
        }
    }


    fun onErrorClick(message: String, audio: Int) {
        val toast: Toast = Toast.makeText(this, message, Toast.LENGTH_SHORT)
        toast.show()
        val music: MediaPlayer = MediaPlayer.create(this, audio)
        music.start()
    }


    fun filterDrawings(drawingsList: MutableList<Drawing>, term: String): MutableList<Drawing> {
    var words = term.trim().split("\\s+".toRegex()).toTypedArray()
    var result = mutableSetOf<Drawing>()
    var x = drawingsList.filter {
        words.fold(false) { acc, next -> acc || it.drawingName.contains(next, ignoreCase = true) }
    }
    var y = drawingsList.filter {
        words.fold(false) { acc, next -> acc || getDate(it.creationDate).contains(next, ignoreCase = true) }
    }

    var z = drawingsList.filter {
        words.fold(false) { acc, next -> acc || it.owner.contains(next, ignoreCase = true) }
    }
    result.addAll(x)
    result.addAll(y)
    result.addAll(z)
    return result.toMutableList()

}





    fun getStr(ref: Int): String = languageManager.localizedContext!!.getString(ref)

    fun getDate(seconds: Long): String {
        val simpleDateFormat = SimpleDateFormat("dd-MM-yyyy", Locale.CANADA)
        return simpleDateFormat.format(seconds)
    }

    private var mViewPagerAdapter: ViewPagerAdapter? = null
    @RequiresApi(Build.VERSION_CODES.N)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        albumName = intent.getStringExtra("albumName")
        useremail = readSharedPref("useremail")
        setContentView(R.layout.activity_carousel)
        runOnUiThread {
            val createDrawingButton = findViewById<Button>(R.id.create_button)
            createDrawingButton.text = languageManager.localizedContext!!.getString(R.string.create_drawing)
        }
        mViewPager = findViewById<View>(R.id.viewPagerMain) as ViewPager
        title = getStr(R.string.drawings)
        runBlocking {
            launch {
                updateDrawings(albumName!!, false)
                if(drawingsList.isEmpty()) {
                    val placeholder = findViewById<TextView>(R.id.placeholder)
                    placeholder.text = languageManager.localizedContext!!.getString(R.string.no_drawing)
                    placeholder.visibility = View.VISIBLE
                }
                mViewPagerAdapter = ViewPagerAdapter(this@CarouselActivity, drawingsList, albumName!!)
                mViewPager!!.adapter = mViewPagerAdapter
                setCreateDrawingPrompt(albumName!!)
                setDrawingEvents()
                setFilterDrawingPrompt()
            }
        }

    }
}