package com.example.colorimage.carousel

import android.app.AlertDialog
import android.content.Context
import android.content.Intent
import android.media.MediaPlayer
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.view.animation.Animation
import android.view.animation.AnimationUtils
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.viewpager.widget.PagerAdapter
import com.example.colorimage.*
import com.example.colorimage.http.*
import com.example.colorimage.svgcanvas.SVGCanvasActivity
import kotlinx.coroutines.launch
import kotlinx.coroutines.runBlocking
import java.util.*
import com.example.colorimage.albums.AlbumsActivity
import com.google.android.material.switchmaterial.SwitchMaterial
import com.google.android.material.textfield.TextInputLayout
import com.google.gson.Gson
import java.text.SimpleDateFormat


class ViewPagerAdapter(
    var context: Context,
    var drawingsList: MutableList<Drawing>,
    var albumName: String
) :
    PagerAdapter() {
    var mLayoutInflater: LayoutInflater
    var httpService: HttpService = HttpService.create()
    var mcontext = context
    var sendAddRequest = false
    override fun getCount(): Int {
        return drawingsList.size
    }

    override fun isViewFromObject(view: View, `object`: Any): Boolean {
        return view === `object` as LinearLayout
    }

    override fun instantiateItem(container: ViewGroup, position: Int): Any {

        val itemView: View = mLayoutInflater.inflate(R.layout.carousel_item, container, false)
        val editButton = itemView.findViewById<Button>(R.id.edit_button)
        val deleteButton = itemView.findViewById<Button>(R.id.delete_drawing_button)
        val propertiesButton = itemView.findViewById<Button>(R.id.properties_button)
        (mcontext as CarouselActivity).runOnUiThread {
            editButton.text = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.edit)
            deleteButton.text = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.delete)
            propertiesButton.text = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.properties)
        }

        val collaboratorsView = itemView.findViewById<View>(R.id.collaborators) as TextView
        val drawingTitleView = itemView.findViewById<View>(R.id.drawing_title) as TextView
        val drawingOwnerView = itemView.findViewById<View>(R.id.drawing_owner) as TextView
        val creationDateView = itemView.findViewById<View>(R.id.creation_date) as TextView

        (mcontext as CarouselActivity).runOnUiThread {
            val nbCollaborators = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(
                R.string.collaborators,
                drawingsList[position].members!!.size
            )
            val drawingTitle =
                (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.drawing_title, drawingsList[position].drawingName)
            val drawingOwner =
                (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.drawing_owner, drawingsList[position].owner)
            val simpleDateFormat =
                SimpleDateFormat("dd-MM-yyyy", Locale.CANADA)
            val dateString = simpleDateFormat.format(drawingsList[position].creationDate)
            val creationDate = (context as CarouselActivity).languageManager .localizedContext!!.getString(R.string.creation_date, dateString)

            collaboratorsView.text = nbCollaborators
            drawingTitleView.text = drawingTitle
            drawingOwnerView.text = drawingOwner
            creationDateView.text = creationDate
        }


            if(drawingsList[position].visibility == "protected") {
                editButton.setOnClickListener {

                    val builder = AlertDialog.Builder((mcontext as CarouselActivity))
                    val inflater = (mcontext as CarouselActivity).layoutInflater
                    val dialogLayout = inflater.inflate(R.layout.password, null)
                    val passwordEditText =
                        dialogLayout.findViewById<EditText>(R.id.text_input_pass_join)
                    passwordEditText.hint = getStr(R.string.enter_password_to_join)

                    with(builder) {
                        (mcontext as CarouselActivity).runOnUiThread {
                            setTitle(
                                getStr(R.string.enter_password_to_join)
                            )
                            setPositiveButton(getStr(R.string.join)) { dialog, which ->

                                val joinDrawingRequestPass = JoinDrawingRequestPass(readSharedPref("useremail")!!, drawingsList[position].drawingName, passwordEditText.text.toString())
                                runBlocking {
                                    launch {
                                        val x = httpService.joinDrawing(joinDrawingRequestPass)
                                        BaseActivity.joinedDrawings.add(drawingsList[position].drawingName)
                                        if(x!!.message == "success") {
                                            val intent = Intent(context, SVGCanvasActivity::class.java)
                                            intent.putExtra("drawingName", drawingsList[position].drawingName)
                                            intent.putExtra("password", true)
                                            context.startActivity(intent)
                                            (mcontext as CarouselActivity).overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
                                        }
                                        else {
                                            val toast: Toast = Toast.makeText(context, getStr(R.string.wrong_password), Toast.LENGTH_SHORT)
                                            toast.show()
                                            val music: MediaPlayer = MediaPlayer.create(context, R.raw.error)
                                            music.start()
                                        }
                                    }
                                }


                            }
                            setNegativeButton(getStr(R.string.cancel)) { dialog, which -> }
                            setView(dialogLayout)
                            show()
                        }
                    }
                }
            } else {
                editButton.setOnClickListener {
                val intent = Intent(context, SVGCanvasActivity::class.java)
                intent.putExtra("drawingName", drawingsList[position].drawingName)
                context.startActivity(intent)
                (mcontext as CarouselActivity).overridePendingTransition(android.R.anim.slide_in_left, android.R.anim.slide_in_left)
            }
            }





        deleteButton.setOnClickListener {
            if (!isOwner(position)) {
                onErrorClick(
                    deleteButton,
                    (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.not_the_owner_drawing),
                    R.raw.error
                )
            } else {
                val music: MediaPlayer = MediaPlayer.create(context, R.raw.bin)
                music.start()
            runBlocking {
                launch {
                    val deleteDrawingRequest =
                        DeleteDrawingRequest(drawingsList!![position].drawingName)
                    val x = httpService.deleteDrawing(deleteDrawingRequest)
                    updateDrawings()
                }
            }
        }

        }



        propertiesButton.setOnClickListener {
            if (!isOwner(position)) {
                onErrorClick(propertiesButton, (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.not_the_owner_drawing), R.raw.error )
            } else {
            runBlocking {
                launch {
                    val builder = AlertDialog.Builder(it.rootView.context)
                    val albumsList = httpService.getAllAlbums()!!.filter { it.members?.contains((readSharedPref("useremail")))!! && it.albumName != "PUBLIC" }

                    val albumsNamesList = albumsList.map { it.albumName }
                    val albumsArrayList = ArrayList(albumsNamesList)
                    val visibilityArrayList = arrayListOf("public", "privé")
                    val dialogLayout = mLayoutInflater.inflate(R.layout.modify_drawing_prompt, null)


                    val visibilitySwitch =
                        dialogLayout.findViewById<SwitchMaterial>(R.id.visibility_switch)
                    visibilitySwitch.text = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.modify_visibility)
                    val passwordInput = dialogLayout.findViewById<EditText>(R.id.modify_password_text_edit)
                    passwordInput.hint = (mcontext as CarouselActivity).languageManager.localizedContext!!.getString(R.string.modify_password)
                    if(drawingsList!![position].visibility == "protected") {
                        visibilitySwitch.visibility = View.GONE
                        passwordInput.visibility = View.VISIBLE
                    } else {
                        passwordInput.visibility = View.GONE
                        visibilitySwitch.visibility = View.VISIBLE
                    }
                    val autoCompAlbums =
                        dialogLayout.findViewById<AutoCompleteTextView>(R.id.autoCompAlbums)
                    val autoCompAlbumInput =
                        dialogLayout.findViewById<TextInputLayout>(R.id.autoCompAlbumsInput)

                    val modifyNameTextEdit =
                        dialogLayout.findViewById<EditText>(R.id.modify_name_text_edit)
                    modifyNameTextEdit.hint = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.modify_drawing_name)
                    val autoCompVisibility =
                        dialogLayout.findViewById<AutoCompleteTextView>(R.id.autoCompVisibility)

                    val autoCompVisibilityInput =
                        dialogLayout.findViewById<TextInputLayout>(R.id.autoCompVisibilityInput)
                    autoCompVisibility.setText("public")
                    autoCompAlbums.hint = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.to_which_album)
                    autoCompAlbumInput.hint = (mcontext as CarouselActivity).languageManager .localizedContext!!.getString(R.string.to_which_album)
                    autoCompVisibility.hint =
                        (mcontext as CarouselActivity).languageManager.localizedContext!!.getString(
                            R.string.choose_visibility
                        )
                    autoCompVisibilityInput.hint =
                        (mcontext as CarouselActivity).languageManager.localizedContext!!.getString(
                            R.string.choose_visibility
                        )
                    var albumItem: String?
                    var visibilityItem: String?

                    autoCompAlbums.setAdapter(
                        ArrayAdapter(
                            context,
                            R.layout.drop_down_item,
                            albumsArrayList
                        )
                    )
                    autoCompVisibility.setAdapter(
                        ArrayAdapter(
                            context,
                            R.layout.drop_down_item,
                            visibilityArrayList
                        )
                    )
                    visibilityItem = autoCompVisibility.text.toString()
                    albumItem = autoCompAlbums.text.toString()


                    visibilitySwitch.setOnCheckedChangeListener { buttonView, isChecked ->
                        if (isChecked) {
                            autoCompVisibility.visibility =
                                View.VISIBLE
                            autoCompVisibilityInput.visibility =
                                View.VISIBLE
                            autoCompAlbums.visibility =
                                View.GONE
                            autoCompAlbumInput.visibility =
                                View.GONE
                        } else {
                            autoCompAlbums.visibility =
                                View.GONE
                            autoCompVisibility.visibility =
                                View.GONE
                            autoCompAlbumInput.visibility =
                                View.GONE
                            autoCompVisibilityInput.visibility =
                                View.GONE
                        }
                    }
                    autoCompAlbums.setOnItemClickListener { parent, view, position, id ->
                        albumItem = parent.getItemAtPosition(position).toString()
                    }

                    autoCompVisibility.setOnItemClickListener { parent, view, position, id ->
                        visibilityItem = parent.getItemAtPosition(position).toString()
                        if (visibilityItem == "public") {
                            autoCompAlbums.visibility =
                                View.GONE
                            autoCompAlbumInput.visibility = View.GONE
                        } else {
                            autoCompAlbums.visibility =
                                View.VISIBLE
                            autoCompAlbumInput.visibility = View.VISIBLE
                        }
                    }

                    with(builder) {
                        (mcontext as CarouselActivity).runOnUiThread {
                            setTitle(
                                (mcontext as CarouselActivity).languageManager.localizedContext!!.getString(
                                    R.string.modify_drawing
                                )
                            )
                            setPositiveButton(
                                (mcontext as CarouselActivity).languageManager.localizedContext!!.getString(
                                    R.string.modify
                                )
                            ) { dialog, which ->
                                if (modifyNameTextEdit.text.toString().isEmpty() && passwordInput.text.toString().isEmpty() && !visibilitySwitch.isChecked) {
                                    onErrorClick(getStr(R.string.no_empty_field), R.raw.ui2)
                                }
                                var name = modifyNameTextEdit.text.toString()
                                val condition = modifyNameTextEdit.text.toString() == drawingsList!![position].drawingName || modifyNameTextEdit.text.toString()
                                            .isEmpty()

                                val updateDrawingRequestNewName = UpdateDrawingRequestNewName (
                                    name,
                                    readSharedPref("useremail")!!,
                                    DrawingData(
                                        drawingsList!![position].drawingName,
                                        if (visibilityItem == "public") "public" else "private"
                                    )
                                )


                                val changePasswordRequest = ChangePasswordRequest(readSharedPref("useremail")!!, drawingsList!![position].drawingName, passwordInput.text.toString())
                                if (visibilitySwitch.isChecked) {

                                    val updateDrawingRequest = UpdateDrawingRequest (
                                        readSharedPref("useremail")!!,
                                        DrawingData(
                                            drawingsList!![position].drawingName,
                                            if (visibilityItem == "public") "public" else "private"
                                        )
                                    )
                                    val addDrawingRequest = AddDrawingRequest(
                                        if (name.isEmpty()) drawingsList!![position].drawingName else name ,
                                        readSharedPref("useremail")!!,
                                        if (visibilityItem == "public") "PUBLIC" else albumItem!!
                                    )
                                    runBlocking {
                                        launch {
                                            if (condition) {
                                                Log.i("update_drawing", updateDrawingRequest.toString())
                                                val x = httpService.updateDrawing(updateDrawingRequest)
                                                Log.i("update_drawing", x!!.message)
                                            } else {
                                                Log.i("update_drawing", updateDrawingRequestNewName.toString())
                                                val x = httpService.updateDrawing(updateDrawingRequestNewName)
                                                Log.i("update_drawing", x!!.message)
                                            }
                                            while (!sendAddRequest) {

                                            }
                                            Log.i("add_drawing", addDrawingRequest.toString())
                                            val y = httpService.addDrawing(addDrawingRequest)
                                            Log.i("add_drawing", y!!.message)
                                                    updateDrawings()
                                        }
                                        sendAddRequest = false
                                    }
                                } else if (drawingsList!![position].visibility == "protected" && !condition) {


                                        runBlocking {
                                            launch {
                                                Log.i(
                                                    "change_password",
                                                    changePasswordRequest.toString()
                                                )
                                                val y = httpService.changePassword(changePasswordRequest)
                                                Log.i(
                                                        "change_passsword",
                                                y.toString()
                                                )
                                                Log.i(
                                                    "update_drawing",
                                                    updateDrawingRequestNewName.toString()
                                                )
                                                val x =
                                                    httpService.updateDrawing(updateDrawingRequestNewName)
                                                Log.i("update_drawing", x!!.message)
                                            }
                                        }

                                } else if (drawingsList!![position].visibility == "protected" && condition) {
                                    runBlocking {
                                        launch {
                                            Log.i(
                                                "change_password",
                                                changePasswordRequest.toString()
                                            )
                                            val y =
                                                httpService.changePassword(changePasswordRequest)
                                            Log.i(
                                                "change_passsword",
                                                y.toString()
                                            )
                                        }}
                                } else if (drawingsList!![position].visibility != "protected" && !condition){

                                    runBlocking {
                                        launch {
                                            Log.i(
                                                "update_drawing",
                                                updateDrawingRequestNewName.toString()
                                            )

                                        val x =
                                            httpService.updateDrawing(updateDrawingRequestNewName)
                                        Log.i("update_drawing", x!!.message)
                                    }}
                                }
                            }
                            setNegativeButton(
                                (mcontext as CarouselActivity).languageManager.localizedContext!!.getString(
                                    R.string.cancel
                                )
                            ) { dialog, which -> }
                            setView(dialogLayout)
                            show()
                        }

                    }
                }
            }
        }
        }

        Objects.requireNonNull(container).addView(itemView)
        return itemView
    }

    private fun readSharedPref(key: String): String? {
        return context.getSharedPreferences("myAppPrefs", AppCompatActivity.MODE_PRIVATE)
            .getString(key, null)
    }

    fun onErrorClick(message: String, audio: Int) {
        val toast: Toast = Toast.makeText(context, message, Toast.LENGTH_SHORT)
        toast.show()
        val music: MediaPlayer = MediaPlayer.create(context, audio)
        music.start()
    }

    fun setSocket() {
        SocketHandler.getSingletonSocket()!!.on("DRAWINGMODIFIED") {event ->

            val jsonString = event[0].toString()
            val drawingModified = Gson().fromJson(jsonString, DrawingModified::class.java)
            if (!drawingModified.oldName.isNullOrEmpty()) {
                sendAddRequest = true
            }


        }
    }


    private fun onErrorClick(button: Button, message: String, audio: Int) {
        val toast: Toast = Toast.makeText(context, message, Toast.LENGTH_SHORT)
        val animation: Animation =  AnimationUtils.loadAnimation(
            context,
            R.anim.wobble
        )
        animation.repeatCount = 3
        button.startAnimation(animation)
        toast.show()
        val music: MediaPlayer = MediaPlayer.create(context, audio)
        music.start()
    }


    fun getStr(ref: Int): String = (mcontext as CarouselActivity).languageManager.localizedContext!!.getString(ref)

    override fun getItemPosition(`object`: Any): Int {
        return POSITION_NONE
    }

    private fun isOwner(position: Int) = readSharedPref("useremail")!! == drawingsList[position].owner


    private suspend fun updateDrawings() {
        (mcontext as CarouselActivity).updateDrawings(albumName, true)
    }

    override fun destroyItem(container: ViewGroup, position: Int, `object`: Any) {
        container.removeView(`object` as LinearLayout)
    }

    init {
        setSocket()
        mLayoutInflater =
            context.getSystemService(Context.LAYOUT_INFLATER_SERVICE) as LayoutInflater
    }
}
